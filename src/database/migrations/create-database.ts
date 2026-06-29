import { Client } from 'pg';
import { ConfigService } from 'src/config/config.service';

async function createDatabase() {
  const client = new Client({
    host: ConfigService.config.postgress.POSTGRES_HOST,
    port: ConfigService.config.postgress.POSTGRES_PORT,
    user: ConfigService.config.postgress.POSTGRES_USER,
    password: ConfigService.config.postgress.POSTGRES_PASSWORD,
    database: 'postgres', // connect to default database
  });

  await client.connect();

  const dbName = ConfigService.config.postgress.POSTGRES_DB;

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
