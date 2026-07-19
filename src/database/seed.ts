import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { TicketEntity } from './../ticket/ticket.entity';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { chunk } from 'lodash';

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
        const sanitizedBatch = batch.map((ticket) => ({
          ...ticket,
          closeddate: ticket.closeddate === '' ? null : ticket.closeddate,
          createdtime: ticket.createdtime === '' ? null : ticket.createdtime,
          accountname: ticket.accountname === '' ? null : ticket.accountname,
        }));

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
