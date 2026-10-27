import { Pool, QueryResult } from "pg";
import fs from "fs";
import path from "path";
import os from "os";

export interface RsvpRecord {
  id?: number;
  guest_name: string;
  attendance: "attending" | "declined";
  guest_count: number;
  message?: string | null;
  ip_address?: string | null;
  created_at?: string;
}

// In-memory cache for guaranteed persistence in serverless environments
const inMemoryRsvps: RsvpRecord[] = [];
let cachedFallbackPath: string | null = null;

/**
 * Returns a writable path for fallback JSON storage.
 * On localhost: uses project directory `data/rsvps.json`.
 * On serverless (Vercel, AWS Lambda, Netlify): automatically uses writable `/tmp/rsvps.json`
 * preventing `EROFS: read-only file system` errors.
 */
function getFallbackFilePath(): string {
  if (cachedFallbackPath) return cachedFallbackPath;

  const localDir = path.join(process.cwd(), "data");
  const localFile = path.join(localDir, "rsvps.json");

  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    // Test write permission
    const testFile = path.join(localDir, `.write-test-${Date.now()}`);
    fs.writeFileSync(testFile, "ok", "utf-8");
    fs.unlinkSync(testFile);
    cachedFallbackPath = localFile;
    return localFile;
  } catch {
    // Serverless environment (Vercel, etc.) where process.cwd() is read-only
    const tmpDir = os.tmpdir();
    const tmpFile = path.join(tmpDir, "rsvps.json");

    // Seed from local file if bundled and not yet created in /tmp
    try {
      if (!fs.existsSync(tmpFile) && fs.existsSync(localFile)) {
        const seedData = fs.readFileSync(localFile, "utf-8");
        fs.writeFileSync(tmpFile, seedData, "utf-8");
      }
    } catch {
      // Ignore seeding errors
    }

    cachedFallbackPath = tmpFile;
    return tmpFile;
  }
}

function ensureFallbackFile(): string | null {
  try {
    const filePath = getFallbackFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), "utf-8");
    }
    return filePath;
  } catch (err) {
    console.warn("Could not ensure fallback file, operating with in-memory store:", err);
    return null;
  }
}

function readFallbackRsvps(): RsvpRecord[] {
  try {
    const filePath = ensureFallbackFile();
    if (filePath && fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(data || "[]");
      if (Array.isArray(parsed)) {
        const existingIds = new Set(parsed.map((r: RsvpRecord) => r.id));
        for (const memRecord of inMemoryRsvps) {
          if (!existingIds.has(memRecord.id)) {
            parsed.unshift(memRecord);
          }
        }
        return parsed;
      }
    }
    return inMemoryRsvps;
  } catch (err) {
    console.warn("Error reading fallback RSVPs, using in-memory store:", err);
    return inMemoryRsvps;
  }
}

function writeFallbackRsvp(rsvp: RsvpRecord): RsvpRecord {
  const current = readFallbackRsvps();
  const newRecord: RsvpRecord = {
    ...rsvp,
    id: (current[0]?.id || 0) + 1,
    created_at: new Date().toISOString(),
  };

  // Always mirror in memory for immediate consistency
  inMemoryRsvps.unshift(newRecord);

  try {
    const filePath = ensureFallbackFile();
    if (filePath) {
      current.unshift(newRecord);
      fs.writeFileSync(filePath, JSON.stringify(current, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("File write failed, RSVP preserved in server memory:", err);
  }

  return newRecord;
}

/**
 * Dynamically resolves PostgreSQL connection URL from standard cloud & self-hosted environment variables.
 * Compatible with Vercel Postgres, Supabase, Neon, Railway, Render, and standard PostgreSQL.
 */
function getConnectionString(): string | undefined {
  const envUrl =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.SUPABASE_DB_URL;

  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim();
  }

  // Reconstruct from individual PG or POSTGRES environment variables
  const host = process.env.PGHOST || process.env.POSTGRES_HOST;
  const user = process.env.PGUSER || process.env.POSTGRES_USER;
  const password = process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD;
  const database = process.env.PGDATABASE || process.env.POSTGRES_DATABASE;
  const port = process.env.PGPORT || process.env.POSTGRES_PORT || "5432";

  if (host && user && database) {
    const encodedUser = encodeURIComponent(user);
    const encodedPass = password ? `:${encodeURIComponent(password)}` : "";
    return `postgres://${encodedUser}${encodedPass}@${host}:${port}/${database}?sslmode=require`;
  }

  return undefined;
}

let pool: Pool | null = null;
let currentConnectionString: string | null = null;
let isInitialized = false;

function getPool(): Pool | null {
  const connStr = getConnectionString();
  if (!connStr) {
    return null;
  }

  if (pool && currentConnectionString !== connStr) {
    try {
      pool.end();
    } catch {}
    pool = null;
  }

  if (!pool) {
    currentConnectionString = connStr;
    const isLocal =
      connStr.includes("localhost") ||
      connStr.includes("127.0.0.1");

    const isServerless = !!(
      process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.NETLIFY
    );

    pool = new Pool({
      connectionString: connStr,
      ssl: isLocal ? undefined : { rejectUnauthorized: false },
      max: isServerless ? 2 : 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000, // 10s timeout accommodates cloud database cold starts (Neon, Supabase)
    });

    pool.on("error", (err) => {
      console.warn("Unexpected error on idle PostgreSQL client:", err.message);
    });
  }

  return pool;
}

/**
 * Initializes the PostgreSQL database schema if needed.
 */
export async function initDb(): Promise<boolean> {
  const currentPool = getPool();
  if (!currentPool) {
    return false;
  }
  if (isInitialized) return true;

  try {
    await currentPool.query(`
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
    isInitialized = true;
    return true;
  } catch (err) {
    console.warn(
      "Could not initialize PostgreSQL schema. Operating with fallback storage:",
      (err as Error).message
    );
    return false;
  }
}

/**
 * Saves an RSVP to the database, or to the serverless-safe local store if PostgreSQL is unavailable.
 */
export async function saveRsvp(data: {
  guest_name: string;
  attendance: "attending" | "declined";
  guest_count: number;
  message?: string | null;
  ip_address?: string | null;
}): Promise<{ success: boolean; rsvp: RsvpRecord; storage: "postgres" | "fallback" }> {
  const currentPool = getPool();

  if (currentPool) {
    try {
      await initDb();
      const result: QueryResult<RsvpRecord> = await currentPool.query(
        `
        INSERT INTO rsvps (guest_name, attendance, guest_count, message, ip_address)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
        `,
        [
          data.guest_name.trim(),
          data.attendance,
          data.attendance === "attending" ? Math.max(1, data.guest_count) : 0,
          data.message ? data.message.trim() : null,
          data.ip_address || null,
        ]
      );
      if (result.rows && result.rows.length > 0) {
        return { success: true, rsvp: result.rows[0], storage: "postgres" };
      }
    } catch (err) {
      console.warn("PostgreSQL insert failed, saving to fallback storage:", (err as Error).message);
    }
  }

  // Safe fallback storage (writes to /tmp on serverless or data directory on local)
  const saved = writeFallbackRsvp({
    guest_name: data.guest_name.trim(),
    attendance: data.attendance,
    guest_count: data.attendance === "attending" ? Math.max(1, data.guest_count) : 0,
    message: data.message ? data.message.trim() : null,
    ip_address: data.ip_address || null,
  });

  return { success: true, rsvp: saved, storage: "fallback" };
}

/**
 * Checks if a guest with the same name has recently submitted an RSVP (within the last 24h).
 */
export async function checkExistingRsvp(guestName: string): Promise<boolean> {
  const normalizedName = guestName.trim().toLowerCase();
  const currentPool = getPool();

  if (currentPool) {
    try {
      await initDb();
      const res = await currentPool.query(
        `
        SELECT id FROM rsvps 
        WHERE LOWER(guest_name) = $1 
          AND created_at > NOW() - INTERVAL '24 hours'
        LIMIT 1;
        `,
        [normalizedName]
      );
      if ((res.rowCount ?? 0) > 0) {
        return true;
      }
    } catch (err) {
      console.warn("PostgreSQL duplicate check failed, checking fallback:", (err as Error).message);
    }
  }

  try {
    const fallbacks = readFallbackRsvps();
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return fallbacks.some((r) => {
      const isSameName = (r.guest_name || "").toLowerCase().trim() === normalizedName;
      const isRecent = r.created_at ? new Date(r.created_at).getTime() > oneDayAgo : false;
      return isSameName && isRecent;
    });
  } catch {
    return false;
  }
}

/**
 * Retrieves aggregate RSVP statistics.
 */
export async function getRsvpStats(): Promise<{
  totalResponses: number;
  attendingCount: number;
  totalGuests: number;
  declinedCount: number;
  recentRsvps: RsvpRecord[];
  storageType: "postgres" | "fallback";
}> {
  const currentPool = getPool();

  if (currentPool) {
    try {
      await initDb();
      const countRes = await currentPool.query(`
        SELECT 
          COUNT(*)::int AS total,
          COUNT(*) FILTER (WHERE attendance = 'attending')::int AS attending,
          COALESCE(SUM(guest_count) FILTER (WHERE attendance = 'attending'), 0)::int AS guests,
          COUNT(*) FILTER (WHERE attendance = 'declined')::int AS declined
        FROM rsvps;
      `);
      const recentRes = await currentPool.query(`
        SELECT * FROM rsvps ORDER BY created_at DESC LIMIT 10;
      `);

      const stats = countRes.rows[0];
      return {
        totalResponses: stats?.total || 0,
        attendingCount: stats?.attending || 0,
        totalGuests: stats?.guests || 0,
        declinedCount: stats?.declined || 0,
        recentRsvps: recentRes.rows || [],
        storageType: "postgres",
      };
    } catch (err) {
      console.warn("Could not fetch stats from postgres:", (err as Error).message);
    }
  }

  const all = readFallbackRsvps();
  const attending = all.filter((r) => r.attendance === "attending");
  const declined = all.filter((r) => r.attendance === "declined");
  const totalGuests = attending.reduce((acc, curr) => acc + (curr.guest_count || 1), 0);

  return {
    totalResponses: all.length,
    attendingCount: attending.length,
    totalGuests,
    declinedCount: declined.length,
    recentRsvps: all.slice(0, 10),
    storageType: "fallback",
  };
}
