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

/**
 * Nest project root (`voc_panel/`), found via package.json — not process.cwd()
 * and never the OS drive root.
 */
function projectRoot(): string {
  let dir = __dirname;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir;
    dir = path.dirname(dir);
  }
  // Fallback: dist/crm or src/crm → ../../
  return path.resolve(__dirname, '..', '..');
}

/** Absolute path of `crm-sync-cursors.json` inside the voc_panel project root. */
export function cursorFilePath(): string {
  const configured = ConfigService.config.crm.cursorFile.trim() || 'crm-sync-cursors.json';
  const fileName = path.basename(configured);
  return path.join(projectRoot(), fileName);
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
