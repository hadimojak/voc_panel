import { Client } from 'pg';

async function createDatabase() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: 'postgres', // connect to default database
  });

  await client.connect();

  const dbName = process.env.DB_NAME || 'voc_panel';

  const res = await client.query(
    `SELECT 1 FROM pg_database WHERE datname='${dbName}'`,
  );

  if (res.rowCount === 0) {
    console.log(`Creating database ${dbName}...`);
    await client.query(`CREATE DATABASE ${dbName}`);
  } else {
    console.log(`Database ${dbName} already exists.`);
  }

  await client.end();
}

createDatabase();
