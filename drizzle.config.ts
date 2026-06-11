import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export default {
  schema: './drizzle/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.SUPABASE_DB_HOST!,
    port: parseInt(process.env.SUPABASE_DB_PORT || '5432'),
    user: process.env.SUPABASE_DB_USER || 'postgres',
    password: process.env.SUPABASE_DB_PASSWORD!,
    database: process.env.SUPABASE_DB_NAME || 'postgres',
    ssl: { rejectUnauthorized: false },
  },
  verbose: true,
  strict: true,
} satisfies Config;
