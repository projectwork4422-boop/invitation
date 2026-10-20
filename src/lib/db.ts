import { Pool, QueryResult } from "pg";
import fs from "fs";
import path from "path";

// Initialize PostgreSQL connection pool if connection string is provided
const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

let pool: Pool | null = null;
let isInitialized = false;

function getPool(): Pool | null {
  if (!connectionString) {
    return null;
  }
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl:
        process.env.NODE_ENV === "production" &&
        !connectionString.includes("localhost") &&
        !connectionString.includes("127.0.0.1")
          ? { rejectUnauthorized: false }
          : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export interface RsvpRecord {
  id?: number;
  guest_name: string;
  attendance: "attending" | "declined";
  guest_count: number;
  message?: string | null;
  ip_address?: string | null;
  created_at?: string;
}

// Fallback file storage path for when PostgreSQL is not yet configured or reachable
const fallbackDir = path.join(process.cwd(), "data");
const fallbackFile = path.join(fallbackDir, "rsvps.json");

function ensureFallbackFile() {
  if (!fs.existsSync(fallbackDir)) {
    fs.mkdirSync(fallbackDir, { recursive: true });
  }
  if (!fs.existsSync(fallbackFile)) {
    fs.writeFileSync(fallbackFile, JSON.stringify([], null, 2), "utf-8");
  }
}

function readFallbackRsvps(): RsvpRecord[] {
  try {
    ensureFallbackFile();
    const data = fs.readFileSync(fallbackFile, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Error reading fallback RSVPs:", err);
    return [];
  }
}

function writeFallbackRsvp(rsvp: RsvpRecord): RsvpRecord {
  ensureFallbackFile();
  const current = readFallbackRsvps();
  const newRecord: RsvpRecord = {
    ...rsvp,
    id: current.length + 1,
    created_at: new Date().toISOString(),
  };
  current.unshift(newRecord);
  fs.writeFileSync(fallbackFile, JSON.stringify(current, null, 2), "utf-8");
  return newRecord;
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
    const client = await currentPool.connect();
    try {
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
      isInitialized = true;
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn(
      "Could not connect to PostgreSQL. Using fallback local storage.",
      (err as Error).message
    );
    return false;
  }
}

/**
 * Saves an RSVP to the database, or to the local store if PostgreSQL is unavailable.
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
      return { success: true, rsvp: result.rows[0], storage: "postgres" };
    } catch (err) {
      console.warn("PostgreSQL insert failed, saving to fallback:", (err as Error).message);
    }
  }

  // Fallback to local persistent JSON store
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
      return (res.rowCount ?? 0) > 0;
    } catch {
      // Ignore error and check fallback
    }
  }

  const fallbacks = readFallbackRsvps();
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  return fallbacks.some((r) => {
    const isSameName = r.guest_name.toLowerCase().trim() === normalizedName;
    const isRecent = r.created_at ? new Date(r.created_at).getTime() > oneDayAgo : false;
    return isSameName && isRecent;
  });
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
        totalResponses: stats.total || 0,
        attendingCount: stats.attending || 0,
        totalGuests: stats.guests || 0,
        declinedCount: stats.declined || 0,
        recentRsvps: recentRes.rows,
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
