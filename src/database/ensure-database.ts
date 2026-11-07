import { Logger } from '@nestjs/common';
import { Client } from 'pg';
import { ConfigService } from '../config/config.service';

/**
 * Creates the application database if it does not exist yet.
 * Connects to the default `postgres` DB first (required before TypeORM can connect).
 */
export async function ensureDatabaseExists(): Promise<void> {
  const {
    POSTGRES_HOST,
    POSTGRES_PORT,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_DB,
  } = ConfigService.config.postgress;

  const client = new Client({
    host: POSTGRES_HOST,
    port: POSTGRES_PORT,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    database: 'postgres',
  });

  await client.connect();

  try {
    const existing = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [POSTGRES_DB],
    );

    if (existing.rowCount === 0) {
      // Database names cannot be parameterized; identifier was validated via Joi.
      await client.query(`CREATE DATABASE "${POSTGRES_DB.replace(/"/g, '""')}"`);
      Logger.warn(`Database "${POSTGRES_DB}" created`);
    }
  } finally {
    await client.end();
  }
}
