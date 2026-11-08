import * as fs from 'node:fs';
import * as path from 'node:path';
import { ConfigService } from '../config/config.service';

export type CrmSyncStream = 'tickets' | 'calls';

export type CrmStreamCursor = {
  lastTicketId: string;
  chunksProcessed: number;
  itemsUpserted: number;
  updatedAt: string | null;
  lastRunAt: string | null;
  lastStoppedReason: string | null;
  lastError: string | null;
};

export type CrmCursorFile = {
  tickets: CrmStreamCursor;
  calls: CrmStreamCursor;
};

const emptyCursor = (lastTicketId: string): CrmStreamCursor => ({
  lastTicketId,
  chunksProcessed: 0,
  itemsUpserted: 0,
  updatedAt: null,
  lastRunAt: null,
  lastStoppedReason: null,
  lastError: null,
});

/** Absolute path of the root JSON cursor file (persists between process restarts). */
export function cursorFilePath(): string {
  const configured = ConfigService.config.crm.cursorFile;
  return path.isAbsolute(configured)
    ? configured
    : path.resolve(process.cwd(), configured);
}

export function readCursorFile(): CrmCursorFile {
  const initialId = ConfigService.config.crm.initialLastTicketId;
  const defaults: CrmCursorFile = {
    tickets: emptyCursor(initialId),
    calls: emptyCursor(initialId),
  };

  const file = cursorFilePath();
  if (!fs.existsSync(file)) return defaults;

  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf8')) as Partial<CrmCursorFile>;
    return {
      tickets: { ...defaults.tickets, ...(raw.tickets ?? {}) },
      calls: { ...defaults.calls, ...(raw.calls ?? {}) },
    };
  } catch {
    return defaults;
  }
}

export function writeStreamCursor(
  stream: CrmSyncStream,
  patch: Partial<CrmStreamCursor>,
): CrmStreamCursor {
  const current = readCursorFile();
  const next: CrmCursorFile = {
    ...current,
    [stream]: {
      ...current[stream],
      ...patch,
      updatedAt: new Date().toISOString(),
    },
  };

  const file = cursorFilePath();
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  fs.renameSync(temp, file);
  return next[stream];
}
