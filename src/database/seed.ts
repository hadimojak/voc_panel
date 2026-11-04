import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { TicketEntity } from './../ticket/ticket.entity';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { chunk } from 'lodash';
import { normalizeOpenEnumValue } from '../common/types/open-enum';

/** Empty strings → null; open-enum fields keep unknown CRM values as-is. */
function sanitizeTicket(ticket: Record<string, unknown>) {
  const emptyToNull = (value: unknown) =>
    value === '' ? null : (value as string | null | undefined);

  return {
    ...ticket,
    closeddate: emptyToNull(ticket.closeddate),
    createdtime: emptyToNull(ticket.createdtime),
    modifiedtime: emptyToNull(ticket.modifiedtime),
    accountname: emptyToNull(ticket.accountname),
    inputchannel: emptyToNull(ticket.inputchannel),
    finalanswer: emptyToNull(ticket.finalanswer),
    description: emptyToNull(ticket.description),
    mainrequest: emptyToNull(ticket.mainrequest),
    mainoffer: emptyToNull(ticket.mainoffer),
    // Open enums: never drop unknown values — only normalize blanks.
    tickettype: normalizeOpenEnumValue(ticket.tickettype),
    complaintstatus: normalizeOpenEnumValue(ticket.complaintstatus),
    maincomplaint: normalizeOpenEnumValue(ticket.maincomplaint),
    mainticket: normalizeOpenEnumValue(ticket.mainticket),
    subticket: normalizeOpenEnumValue(ticket.subticket),
    reqtypeticket: normalizeOpenEnumValue(ticket.reqtypeticket),
    sentiment: normalizeOpenEnumValue(ticket.sentiment),
    priority: normalizeOpenEnumValue(ticket.priority),
  };
}

async function seed() {
  try {
    const filePathArr: string[] = [];
    const filePath1 = path.resolve(process.cwd(), 'day-ticket-1.json');
    filePathArr.push(filePath1);
    // const filePath2 = path.resolve(process.cwd(), 'day-ticket-2.json');
    // filePathArr.push(filePath2);
    // const filePath3 = path.resolve(process.cwd(), 'day-ticket-3.json');
    // filePathArr.push(filePath3);

    for (const element of filePathArr) {
      const filePath = element;
      if (!fs.existsSync(filePath)) {
        throw new Error(`Seed file not found: ${filePath}`);
      }

      const raw = fs.readFileSync(filePath, 'utf8');
      const { tickets } = JSON.parse(raw);

      if (!Array.isArray(tickets)) {
        throw new TypeError('samplData.json must contain an array of tickets');
      }

      await AppDataSource.initialize();

      const repo = AppDataSource.getRepository(TicketEntity);

      console.log(`Seeding ${tickets.length} tickets...`);

      const chunkSize = 100;
      const chunks = chunk(tickets, chunkSize);

      for (const batch of chunks) {
        const sanitizedBatch = batch.map((ticket) =>
          sanitizeTicket(ticket as Record<string, unknown>),
        );

        await repo.insert(sanitizedBatch);
      }

      console.log('✅ Seed completed successfully');

      await AppDataSource.destroy();
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed');
    console.error(error);
    process.exit(1);
  }
}

void seed();
