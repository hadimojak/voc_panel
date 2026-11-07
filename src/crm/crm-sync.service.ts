import {
  ConflictException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import axios, { AxiosError } from 'axios';
import { Repository } from 'typeorm';
import { ConfigService } from '../config/config.service';
import { TicketService } from '../ticket/ticket.service';
import { formatCrmDateTime, oneYearAgoDate } from './crm-date.util';
import { CrmSyncCursorEntity } from './crm-sync-cursor.entity';
import { mapCrmRowToTicket } from './crm-ticket.mapper';
import type {
  CrmFetchRequest,
  CrmFetchResponse,
  CrmSyncResult,
} from './crm.types';

const CURSOR_KEY = 'voc_fetch_all:updated';

@Injectable()
export class CrmSyncService {
  private readonly logger = new Logger(CrmSyncService.name);
  private running = false;

  constructor(
    private readonly ticketService: TicketService,
    @InjectRepository(CrmSyncCursorEntity)
    private readonly cursorRepo: Repository<CrmSyncCursorEntity>,
  ) {}

  @Cron(CronExpression.EVERY_10_HOURS)
  async handleScheduledSync() {
    if (!ConfigService.config.crm.syncEnabled) return;
    try {
      await this.syncUpdatedTickets();
    } catch (error) {
      this.logger.error(
        `Scheduled CRM sync failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async getCursor() {
    const cutoff = oneYearAgoDate();
    const cursor = await this.ensureCursor(cutoff);
    return {
      key: cursor.key,
      lastModified: cursor.lastModified,
      lastTicketId: cursor.lastTicketId,
      chunksProcessed: cursor.chunksProcessed,
      ticketsUpserted: cursor.ticketsUpserted,
      updatedAt: cursor.updatedAt,
      windowStart: formatCrmDateTime(cutoff),
      running: this.running,
    };
  }

  /**
   * Each run:
   * 1) deletes tickets older than 1 year
   * 2) starts CRM fetch from (now - 1 year)
   * 3) pages with next_modified until has_more=false
   * 4) upserts each chunk into tickets
   */
  async syncUpdatedTickets(_options?: {
    reset?: boolean;
  }): Promise<CrmSyncResult> {
    const cutoff = oneYearAgoDate();
    const windowStart = formatCrmDateTime(cutoff);

    if (!ConfigService.config.crm.syncEnabled) {
      return {
        chunks: 0,
        upserted: 0,
        deleted: 0,
        windowStart,
        lastModified: windowStart,
        lastTicketId: ConfigService.config.crm.initialLastTicketId,
        hasMore: false,
        stoppedReason: 'disabled',
      };
    }

    if (this.running) {
      throw new ConflictException('CRM sync is already running');
    }

    this.running = true;
    let chunks = 0;
    let upserted = 0;
    let deleted = 0;

    try {
      deleted = await this.ticketService.deleteOlderThan(cutoff);
      if (deleted > 0) {
        this.logger.warn(
          `Removed ${deleted} ticket(s) older than ${windowStart}`,
        );
      }

      // Always re-open the rolling 1-year window for this job.
      let cursor = await this.resetCursorToWindow(cutoff);
      let hasMore = true;
      let stoppedReason: CrmSyncResult['stoppedReason'] = 'complete';

      while (hasMore) {
        const request: CrmFetchRequest = {
          source: ConfigService.config.crm.source,
          type: 'updated',
          last_modified: cursor.lastModified,
          last_ticketid: cursor.lastTicketId,
          limit: ConfigService.config.crm.limit,
        };

        const response = await this.fetchChunk(request);

        if (!response.success) {
          this.logger.error(
            `CRM returned success=false: ${response.error || 'unknown error'}`,
          );
          stoppedReason = 'crm_error';
          break;
        }

        const rows = Array.isArray(response.data) ? response.data : [];
        if (rows.length === 0) {
          hasMore = false;
          stoppedReason = 'empty_chunk';
          break;
        }

        const tickets = rows.map(mapCrmRowToTicket);
        await this.ticketService.saveMany(tickets);

        chunks += 1;
        upserted += tickets.length;

        const nextModified =
          response.next_modified?.trim() || cursor.lastModified;
        cursor.lastModified = nextModified;
        cursor.chunksProcessed += 1;
        cursor.ticketsUpserted += tickets.length;
        cursor = await this.cursorRepo.save(cursor);

        hasMore = Boolean(response.has_more ?? response.has_mode);
        if (!hasMore) {
          stoppedReason = 'complete';
        }

        this.logger.warn(
          `CRM chunk #${chunks}: upserted ${tickets.length}, next_modified=${nextModified}, has_more=${hasMore}`,
        );
      }

      return {
        chunks,
        upserted,
        deleted,
        windowStart,
        lastModified: cursor.lastModified,
        lastTicketId: cursor.lastTicketId,
        hasMore,
        stoppedReason,
      };
    } finally {
      this.running = false;
    }
  }

  private async fetchChunk(
    body: CrmFetchRequest,
  ): Promise<CrmFetchResponse> {
    try {
      const { data } = await axios.post<CrmFetchResponse>(
        ConfigService.config.crm.fetchUrl,
        body,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 120_000,
          validateStatus: (status) => status >= 200 && status < 300,
        },
      );
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

      this.logger.error(`CRM fetch failed: ${detail}`);
      throw new ServiceUnavailableException(detail);
    }
  }

  private async ensureCursor(cutoff: Date): Promise<CrmSyncCursorEntity> {
    const existing = await this.cursorRepo.findOne({
      where: { key: CURSOR_KEY },
    });
    if (existing) return existing;

    return this.cursorRepo.save(
      this.cursorRepo.create({
        key: CURSOR_KEY,
        lastModified: formatCrmDateTime(cutoff),
        lastTicketId: ConfigService.config.crm.initialLastTicketId,
        chunksProcessed: 0,
        ticketsUpserted: 0,
      }),
    );
  }

  private async resetCursorToWindow(
    cutoff: Date,
  ): Promise<CrmSyncCursorEntity> {
    await this.cursorRepo.delete({ key: CURSOR_KEY });
    return this.cursorRepo.save(
      this.cursorRepo.create({
        key: CURSOR_KEY,
        lastModified: formatCrmDateTime(cutoff),
        lastTicketId: ConfigService.config.crm.initialLastTicketId,
        chunksProcessed: 0,
        ticketsUpserted: 0,
      }),
    );
  }
}
