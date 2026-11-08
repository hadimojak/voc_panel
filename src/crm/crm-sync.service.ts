import {
  ConflictException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios, { AxiosError } from 'axios';
import { CallService } from '../call/call.service';
import { ConfigService } from '../config/config.service';
import { CustomerService } from '../customer/customer.service';
import { TicketService } from '../ticket/ticket.service';
import { mapCrmRowToCall, mapCrmRowToCustomer } from './crm-call.mapper';
import {
  cursorFilePath,
  readCursorFile,
  writeStreamCursor,
  type CrmSyncStream,
} from './crm-cursor.store';
import { mapCrmRowToTicket } from './crm-ticket.mapper';
import type {
  CrmFetchResponse,
  CrmNewFetchRequest,
  CrmStreamStatus,
  CrmSyncResult,
  CrmSyncStartResponse,
  CrmSyncStatusResponse,
} from './crm.types';

@Injectable()
export class CrmSyncService {
  private readonly logger = new Logger(CrmSyncService.name);
  private readonly running: Record<CrmSyncStream, boolean> = {
    tickets: false,
    calls: false,
  };

  constructor(
    private readonly ticketService: TicketService,
    private readonly callService: CallService,
    private readonly customerService: CustomerService,
  ) {}

  @Cron(CronExpression.EVERY_10_HOURS)
  async handleScheduledSync() {
    if (!ConfigService.config.crm.syncEnabled) return;
    try {
      if (!this.running.tickets) {
        await this.runStream('tickets');
      }
      if (!this.running.calls) {
        await this.runStream('calls');
      }
    } catch (error) {
      this.logger.error(
        `Scheduled CRM sync failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  getStatus(): CrmSyncStatusResponse {
    const file = readCursorFile();
    return {
      tickets: this.toStreamStatus('tickets', file.tickets),
      calls: this.toStreamStatus('calls', file.calls),
      cursorFile: cursorFilePath(),
    };
  }

  /** Fire-and-forget job: pages CRM `type=new` until `has_more=false`. */
  startTicketsSync(options?: { reset?: boolean }): CrmSyncStartResponse {
    return this.startStream('tickets', options?.reset);
  }

  startCallsSync(options?: { reset?: boolean }): CrmSyncStartResponse {
    return this.startStream('calls', options?.reset);
  }

  private startStream(
    stream: CrmSyncStream,
    reset?: boolean,
  ): CrmSyncStartResponse {
    if (!ConfigService.config.crm.syncEnabled) {
      writeStreamCursor(stream, {
        lastStoppedReason: 'disabled',
        lastError: null,
        lastRunAt: new Date().toISOString(),
      });
      const cursor = readCursorFile()[stream];
      return {
        started: false,
        stream,
        running: false,
        lastTicketId: cursor.lastTicketId,
      };
    }

    if (this.running[stream]) {
      throw new ConflictException(
        `CRM ${stream} sync is already running`,
      );
    }

    if (reset) {
      writeStreamCursor(stream, {
        lastTicketId: ConfigService.config.crm.initialLastTicketId,
        chunksProcessed: 0,
        itemsUpserted: 0,
        lastStoppedReason: null,
        lastError: null,
      });
    }

    this.running[stream] = true;
    void this.runStream(stream)
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : String(error);
        this.logger.error(`CRM ${stream} sync failed: ${message}`);
        writeStreamCursor(stream, {
          lastStoppedReason: 'crm_error',
          lastError: message,
        });
      })
      .finally(() => {
        this.running[stream] = false;
      });

    const cursor = readCursorFile()[stream];
    return {
      started: true,
      stream,
      running: true,
      lastTicketId: cursor.lastTicketId,
    };
  }

  private async runStream(stream: CrmSyncStream): Promise<CrmSyncResult> {
    const fetchUrl =
      stream === 'tickets'
        ? ConfigService.config.crm.fetchUrl
        : ConfigService.config.crm.callsFetchUrl;

    let cursor = writeStreamCursor(stream, {
      lastRunAt: new Date().toISOString(),
      lastError: null,
      lastStoppedReason: null,
    });

    let chunks = 0;
    let upserted = 0;
    let hasMore = true;
    let stoppedReason: CrmSyncResult['stoppedReason'] = 'complete';

    while (hasMore) {
      // Body must match CRM samples exactly — only these four keys.
      const request = this.buildNewFetchBody(cursor.lastTicketId);
      const response = await this.fetchChunk(fetchUrl, request);

      if (!response.success) {
        this.logger.error(
          `CRM ${stream} returned success=false: ${response.error || 'unknown error'}`,
        );
        stoppedReason = 'crm_error';
        cursor = writeStreamCursor(stream, {
          lastStoppedReason: stoppedReason,
          lastError: response.error || 'CRM success=false',
        });
        break;
      }

      const rows = Array.isArray(response.data) ? response.data : [];
      if (rows.length === 0) {
        hasMore = false;
        stoppedReason = 'empty_chunk';
        cursor = writeStreamCursor(stream, {
          lastStoppedReason: stoppedReason,
          lastError: null,
        });
        break;
      }

      if (stream === 'tickets') {
        await this.ticketService.saveMany(rows.map(mapCrmRowToTicket));
      } else {
        const calls = rows.map(mapCrmRowToCall);
        await this.callService.upsertMany(calls);
        const customers = rows
          .map(mapCrmRowToCustomer)
          .filter((row): row is NonNullable<typeof row> => Boolean(row));
        // Deduplicate by nationalcode within the chunk.
        const byKey = new Map(customers.map((c) => [c.nationalcode, c]));
        await this.customerService.upsertMany([...byKey.values()]);
      }

      chunks += 1;
      upserted += rows.length;

      const nextTicketId = String(
        response.next_ticketid ??
          rows[rows.length - 1]?.ticketid ??
          cursor.lastTicketId,
      );

      hasMore = Boolean(response.has_more ?? response.has_mode);
      stoppedReason = hasMore ? stoppedReason : 'complete';

      cursor = writeStreamCursor(stream, {
        lastTicketId: nextTicketId,
        chunksProcessed: cursor.chunksProcessed + 1,
        itemsUpserted: cursor.itemsUpserted + rows.length,
        lastStoppedReason: hasMore ? null : stoppedReason,
        lastError: null,
      });

      this.logger.warn(
        `CRM ${stream} chunk #${chunks}: upserted ${rows.length}, next_ticketid=${nextTicketId}, has_more=${hasMore}`,
      );
    }

    return {
      stream,
      chunks,
      upserted,
      lastTicketId: cursor.lastTicketId,
      hasMore,
      stoppedReason,
    };
  }

  /** Builds the CRM `--data` body from tickets_all.txt / calls_all.txt. */
  private buildNewFetchBody(lastTicketId: string | number): CrmNewFetchRequest {
    return {
      source: ConfigService.config.crm.source,
      type: 'new',
      last_ticketid: this.toCrmTicketIdNumber(lastTicketId),
      limit: ConfigService.config.crm.limit,
    };
  }

  /** CRM samples send a JSON number (`0`), not a string. */
  private toCrmTicketIdNumber(value: string | number): number {
    const asNumber = typeof value === 'number' ? value : Number(String(value).trim());
    if (!Number.isFinite(asNumber) || asNumber < 0) return 0;
    return Math.trunc(asNumber);
  }

  private async fetchChunk(
    url: string,
    body: CrmNewFetchRequest,
  ): Promise<CrmFetchResponse> {
    try {
      const { data } = await axios.post<CrmFetchResponse>(url, body, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 120_000,
        validateStatus: (status) => status >= 200 && status < 300,
      });
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      const detail =
        axiosError.code === 'ENOTFOUND' ||
        axiosError.code === 'ECONNREFUSED' ||
        axiosError.code === 'ETIMEDOUT' ||
        axiosError.message.includes('Network')
          ? 'CRM unreachable — connect to the company VPN and retry'
          : axiosError.message;

      this.logger.error(`CRM fetch failed (${url}): ${detail}`);
      throw new ServiceUnavailableException(detail);
    }
  }

  private toStreamStatus(
    stream: CrmSyncStream,
    cursor: ReturnType<typeof readCursorFile>['tickets'],
  ): CrmStreamStatus {
    return {
      stream,
      lastTicketId: cursor.lastTicketId,
      chunksProcessed: cursor.chunksProcessed,
      itemsUpserted: cursor.itemsUpserted,
      updatedAt: cursor.updatedAt,
      lastRunAt: cursor.lastRunAt,
      lastStoppedReason: cursor.lastStoppedReason,
      lastError: cursor.lastError,
      running: this.running[stream],
      fetchUrl:
        stream === 'tickets'
          ? ConfigService.config.crm.fetchUrl
          : ConfigService.config.crm.callsFetchUrl,
    };
  }
}
