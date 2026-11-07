import { ensureDatabaseExists } from './ensure-database';

void ensureDatabaseExists()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
