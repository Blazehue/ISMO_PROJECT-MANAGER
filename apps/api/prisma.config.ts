import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Read leniently: `prisma generate` runs at Docker build time without a
    // database. Commands that connect (migrate, seed) fail clearly if it's unset.
    url: process.env.DATABASE_URL ?? '',
  },
});
