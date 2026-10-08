/**
 * Zero-install local PostgreSQL for development and tests (no Docker needed).
 * Runs PostgreSQL on port 5433 with data in apps/api/.pg-data and creates the
 * `ismo` and `ismo_test` databases. Stop it with Ctrl+C.
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
import EmbeddedPostgres from 'embedded-postgres';

const PORT = 5433;
const databaseDir = path.resolve(import.meta.dirname, '../.pg-data');

const pg = new EmbeddedPostgres({
  databaseDir,
  user: 'postgres',
  password: 'postgres',
  port: PORT,
  persistent: true,
});

if (!existsSync(databaseDir)) {
  await pg.initialise();
}
await pg.start();

for (const name of ['ismo', 'ismo_test']) {
  try {
    await pg.createDatabase(name);
  } catch {
    // Already exists.
  }
}

console.log(`PostgreSQL running on postgresql://postgres:postgres@localhost:${PORT}/ismo (Ctrl+C to stop)`);

const shutdown = async () => {
  await pg.stop();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
