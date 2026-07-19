import { AppDataSource } from './data-source';

async function main() {
  await AppDataSource.initialize();

  await AppDataSource.query(`
    UPDATE "public"."tickets"
    SET
      "lat" = ROUND((25.0 + random() * (39.8 - 25.0))::numeric, 6),
      "lng" = ROUND((44.0 + random() * (63.5 - 44.0))::numeric, 6)
    WHERE "lat" IS NULL OR "lng" IS NULL
  `);

  await AppDataSource.destroy();
}

main().catch(async (error) => {
  console.error(error);
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(1);
});
