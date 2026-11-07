import 'reflect-metadata';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { chunk } from 'lodash';
import { AppDataSource } from './data-source';
import { TicketEntity } from '../ticket/ticket.entity';
import { normalizeOpenEnumValue } from '../common/types/open-enum';

const SAMPLE_DIR = path.resolve(
  process.env.USERPROFILE ?? '',
  '.cursor/projects/c-Users-day-Documents-smart-dashboard/attachments/89d6c0d5-8f1c-47b1-bd0f-44f140f52749',
);

const SAMPLE_FILES = [
  'changesssss.txt',
  'changesssss1.txt',
  'changesssss2.txt',
  'changesssss3.txt',
  'changesssss4.txt',
];

const TICKET_COLUMNS = [
  'ticketid',
  'ticket_no',
  'nationalcode',
  'accountname',
  'fname',
  'lname',
  'mobile',
  'productname',
  'branchname',
  'mainticket',
  'subticket',
  'reqtypeticket',
  'createdtime',
  'modifiedtime',
  'tickettype',
  'inputchannel',
  'complainttext',
  'maincomplaint',
  'complaintstatus',
  'finalanswer',
  'closeddate',
  'description',
  'mainrequest',
  'mainoffer',
  'ownername',
  'sentiment',
  'priority',
  'lat',
  'lng',
] as const;

function emptyToNull(value: unknown) {
  return value === '' ? null : value;
}

function sanitizeTicket(raw: Record<string, unknown>): Partial<TicketEntity> {
  const ticket: Record<string, unknown> = {};

  for (const key of TICKET_COLUMNS) {
    if (!(key in raw)) continue;
    ticket[key] = emptyToNull(raw[key]);
  }

  ticket.tickettype = normalizeOpenEnumValue(ticket.tickettype);
  ticket.complaintstatus = normalizeOpenEnumValue(ticket.complaintstatus);
  ticket.maincomplaint = normalizeOpenEnumValue(ticket.maincomplaint);
  ticket.mainticket = normalizeOpenEnumValue(ticket.mainticket);
  ticket.subticket = normalizeOpenEnumValue(ticket.subticket);
  ticket.reqtypeticket = normalizeOpenEnumValue(ticket.reqtypeticket);
  ticket.sentiment = normalizeOpenEnumValue(ticket.sentiment);
  ticket.priority = normalizeOpenEnumValue(ticket.priority);

  return ticket as Partial<TicketEntity>;
}

function loadTicketsFromFile(filePath: string): Record<string, unknown>[] {
  const parsed: unknown = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!parsed || typeof parsed !== 'object') {
    throw new TypeError(`Invalid JSON in ${filePath}`);
  }

  const obj = parsed as { data?: unknown; tickets?: unknown };
  const list = Array.isArray(obj.data)
    ? obj.data
    : Array.isArray(obj.tickets)
      ? obj.tickets
      : null;

  if (!list) {
    throw new TypeError(`${filePath} must contain a data or tickets array`);
  }

  return list as Record<string, unknown>[];
}

async function seed() {
  try {
    const byId = new Map<string, Record<string, unknown>>();

    for (const fileName of SAMPLE_FILES) {
      const filePath = path.join(SAMPLE_DIR, fileName);
      if (!fs.existsSync(filePath)) {
        console.warn(`Skipping missing file: ${filePath}`);
        continue;
      }

      const tickets = loadTicketsFromFile(filePath);
      let added = 0;
      for (const ticket of tickets) {
        const id = String(ticket.ticketid ?? '');
        if (!id || byId.has(id)) continue;
        byId.set(id, ticket);
        added += 1;
      }
      console.log(`${fileName}: ${tickets.length} rows, ${added} new unique`);
    }

    const unique = [...byId.values()];
    console.log(`Upserting ${unique.length} unique tickets...`);

    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(TicketEntity);

    for (const batch of chunk(unique, 100)) {
      const sanitized = batch.map((ticket) => sanitizeTicket(ticket));
      await repo.upsert(sanitized as TicketEntity[], ['ticketid']);
    }

    const total = await repo.count();
    console.log(`✅ Done. tickets table now has ${total} rows.`);
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed');
    console.error(error);
    process.exit(1);
  }
}

void seed();
