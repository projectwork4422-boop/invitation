// PostgreSQL Database connection and schema initializer script
// Run with: node scripts/init-db.mjs

import pg from 'pg';
import fs from 'fs';
import path from 'path';

// Parse .env or .env.local if present
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      }
    }
  }
}

loadEnv();

const { Pool } = pg;
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
  console.log('--------------------------------------------------');
  console.log('⚠️  DATABASE_URL is not configured in .env or .env.local.');
  console.log('The application will use local JSON storage (data/rsvps.json) as a fallback.');
  console.log('To connect to PostgreSQL, set DATABASE_URL in your .env file:');
  console.log('DATABASE_URL="postgresql://postgres:password@localhost:5432/wedding_invitation"');
  console.log('--------------------------------------------------');
  process.exit(0);
}

console.log('Attempting PostgreSQL connection using DATABASE_URL...');

const pool = new Pool({
  connectionString,
  ssl:
    process.env.NODE_ENV === 'production' &&
    !connectionString.includes('localhost') &&
    !connectionString.includes('127.0.0.1')
      ? { rejectUnauthorized: false }
      : undefined,
  connectionTimeoutMillis: 4000,
});

async function main() {
  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!');

    console.log('Creating table "rsvps" if it does not exist...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS rsvps (
        id SERIAL PRIMARY KEY,
        guest_name VARCHAR(255) NOT NULL,
        attendance VARCHAR(50) NOT NULL,
        guest_count INTEGER NOT NULL DEFAULT 1,
        message TEXT,
        ip_address VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_rsvps_guest_name ON rsvps(LOWER(guest_name));
    `);
    console.log('✅ Table "rsvps" and indexes verified.');

    const res = await client.query('SELECT COUNT(*) FROM rsvps;');
    console.log(`📊 Current RSVP count in PostgreSQL: ${res.rows[0].count}`);

    client.release();
    await pool.end();
    console.log('All database checks completed successfully.');
  } catch (err) {
    console.warn('ℹ️  PostgreSQL check notification:', err.message);
    console.log('Note: When a PostgreSQL instance is configured, Next.js connects directly to it.');
    console.log('In the meantime, the built-in fallback store ensures seamless RSVP operation.');
    process.exit(0);
  }
}

main();
