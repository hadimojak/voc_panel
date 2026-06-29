import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { TicketEntity } from './../ticket/ticket.entity';
import * as fs from 'fs';
import * as path from 'path';

async function seed() {
  try {
    const filePath = path.resolve(process.cwd(), 'samplData.json');

    if (!fs.existsSync(filePath)) {
      throw new Error(`Seed file not found: ${filePath}`);
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    const tickets = JSON.parse(raw);

    if (!Array.isArray(tickets)) {
      throw new Error('samplData.json must contain an array of tickets');
    }

    await AppDataSource.initialize();

    const repo = AppDataSource.getRepository(TicketEntity);

    console.log(`Seeding ${tickets.length} tickets...`);

    await repo.insert(tickets);

    console.log('✅ Seed completed successfully');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed');
    console.error(error);
    process.exit(1);
  }
}

seed();
