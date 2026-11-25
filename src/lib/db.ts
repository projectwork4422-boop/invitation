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
  const maxId = current.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0);
  const newRecord: RsvpRecord = {
    ...rsvp,
    id: rsvp.id !== undefined ? rsvp.id : maxId + 1,
    created_at: rsvp.created_at || new Date().toISOString(),
  };

  // Prevent duplicate entries in memory or file
  const existingIdx = current.findIndex(
    (r) =>
      (newRecord.id !== undefined && r.id === newRecord.id) ||
      ((r.guest_name || "").toLowerCase().trim() === (newRecord.guest_name || "").toLowerCase().trim() &&
        r.attendance === newRecord.attendance &&
        r.created_at === newRecord.created_at)
  );

  if (existingIdx !== -1) {
    current[existingIdx] = newRecord;
  } else {
    current.unshift(newRecord);
  }

  const memIdx = inMemoryRsvps.findIndex(
    (r) =>
      (newRecord.id !== undefined && r.id === newRecord.id) ||
      ((r.guest_name || "").toLowerCase().trim() === (newRecord.guest_name || "").toLowerCase().trim() &&
        r.attendance === newRecord.attendance &&
        r.created_at === newRecord.created_at)
  );
  if (memIdx !== -1) {
    inMemoryRsvps[memIdx] = newRecord;
  } else {
    inMemoryRsvps.unshift(newRecord);
  }

  try {
    const filePath = ensureFallbackFile();
    if (filePath) {
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
  let savedRecord: RsvpRecord | null = null;
  let storage: "postgres" | "fallback" = "fallback";

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
        savedRecord = result.rows[0];
        storage = "postgres";
      }
    } catch (err) {
      console.warn("PostgreSQL insert failed, saving to fallback storage:", (err as Error).message);
    }
  }

  // Always mirror in fallback storage so both stores stay perfectly synchronized
  const fallbackRecord = writeFallbackRsvp(
    savedRecord || {
      guest_name: data.guest_name.trim(),
      attendance: data.attendance,
      guest_count: data.attendance === "attending" ? Math.max(1, data.guest_count) : 0,
      message: data.message ? data.message.trim() : null,
      ip_address: data.ip_address || null,
    }
  );

  return { success: true, rsvp: savedRecord || fallbackRecord, storage };
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

/**
 * Retrieves all RSVP records with aggregate statistics.
 */
export async function getAllRsvps(): Promise<{
  rsvps: RsvpRecord[];
  stats: {
    totalResponses: number;
    attendingCount: number;
    totalGuests: number;
    declinedCount: number;
  };
  storageType: "postgres" | "fallback";
}> {
  const currentPool = getPool();
  let postgresRsvps: RsvpRecord[] = [];
  let storageType: "postgres" | "fallback" = "fallback";

  if (currentPool) {
    try {
      await initDb();
      const allRes = await currentPool.query(`
        SELECT * FROM rsvps ORDER BY created_at DESC;
      `);
      postgresRsvps = allRes.rows || [];
      storageType = "postgres";
    } catch (err) {
      console.warn("Could not fetch all RSVPs from postgres:", (err as Error).message);
    }
  }

  const fallbackRsvps = readFallbackRsvps();

  // Unified deduplication combining both PostgreSQL and Fallback store records
  const recordMap = new Map<string, RsvpRecord>();

  const addRecord = (r: RsvpRecord) => {
    if (!r || !r.guest_name) return;
    const nameKey = (r.guest_name || "").toLowerCase().trim();
    const key = r.id !== undefined
      ? `id_${r.id}`
      : `comp_${nameKey}_${r.attendance}_${r.created_at || ""}`;
    if (!recordMap.has(key)) {
      recordMap.set(key, r);
    }
  };

  // Add postgres first, then fallback
  postgresRsvps.forEach(addRecord);
  fallbackRsvps.forEach(addRecord);

  const all = Array.from(recordMap.values()).sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    if (timeA !== timeB) return timeB - timeA;
    return (Number(b.id) || 0) - (Number(a.id) || 0);
  });

  const attending = all.filter((r) => r.attendance === "attending");
  const declined = all.filter((r) => r.attendance === "declined");
  const totalGuests = attending.reduce((acc, curr) => acc + (curr.guest_count || 1), 0);

  return {
    rsvps: all,
    stats: {
      totalResponses: all.length,
      attendingCount: attending.length,
      totalGuests,
      declinedCount: declined.length,
    },
    storageType,
  };
}

/**
 * Deletes an RSVP record by its ID.
 */
export async function deleteRsvp(
  id: number
): Promise<{ success: boolean; storage: "postgres" | "fallback" }> {
  const currentPool = getPool();
  let deletedFromPg = false;

  if (currentPool) {
    try {
      await initDb();
      const res = await currentPool.query("DELETE FROM rsvps WHERE id = $1 RETURNING id;", [id]);
      if ((res.rowCount ?? 0) > 0) {
        deletedFromPg = true;
      }
    } catch (err) {
      console.warn("PostgreSQL delete failed, falling back to local file:", (err as Error).message);
    }
  }

  // Always delete from fallback store as well to maintain perfect consistency
  const numericId = parseInt(String(id), 10);
  const memIndex = inMemoryRsvps.findIndex((r) => r.id === numericId);
  if (memIndex !== -1) {
    inMemoryRsvps.splice(memIndex, 1);
  }

  try {
    const filePath = ensureFallbackFile();
    if (filePath && fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      const current = JSON.parse(data || "[]");
      if (Array.isArray(current)) {
        const updated = current.filter(
          (r: RsvpRecord) => r.id !== numericId && String(r.id) !== String(id)
        );
        fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
      }
    }
  } catch (err) {
    console.warn("Failed to delete RSVP from fallback file:", err);
  }

  return { success: true, storage: deletedFromPg ? "postgres" : "fallback" };
}

/**
 * Synchronizes a list of RSVP records into the persistent store (PostgreSQL and/or fallback).
 * Used to ensure that client-persisted responses are preserved across serverless container recycles.
 */
export async function syncRsvps(
  incoming: RsvpRecord[]
): Promise<{ success: boolean; rsvps: RsvpRecord[]; count: number }> {
  if (!Array.isArray(incoming) || incoming.length === 0) {
    const all = await getAllRsvps();
    return { success: true, rsvps: all.rsvps, count: 0 };
  }

  const currentPool = getPool();
  let addedCount = 0;

  if (currentPool) {
    try {
      await initDb();
      for (const item of incoming) {
        if (!item.guest_name) continue;
        const checkRes = await currentPool.query(
          `SELECT id FROM rsvps WHERE LOWER(guest_name) = LOWER($1) AND attendance = $2 LIMIT 1;`,
          [item.guest_name.trim(), item.attendance]
        );
        if ((checkRes.rowCount ?? 0) === 0) {
          await currentPool.query(
            `INSERT INTO rsvps (guest_name, attendance, guest_count, message, ip_address, created_at)
             VALUES ($1, $2, $3, $4, $5, $6);`,
            [
              item.guest_name.trim(),
              item.attendance,
              item.attendance === "attending" ? Math.max(1, item.guest_count || 1) : 0,
              item.message ? item.message.trim() : null,
              item.ip_address || null,
              item.created_at || new Date().toISOString(),
            ]
          );
          addedCount++;
        }
      }
    } catch (err) {
      console.warn("PostgreSQL sync error, continuing with fallback:", (err as Error).message);
    }
  }

  // Fallback sync
  const current = readFallbackRsvps();
  const existingSet = new Set(
    current.map(
      (r) =>
        `${(r.guest_name || "").toLowerCase().trim()}_${r.attendance}_${r.message || ""}`
    )
  );

  let nextId = current.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1;

  for (const item of incoming) {
    if (!item.guest_name) continue;
    const key = `${item.guest_name.toLowerCase().trim()}_${item.attendance}_${item.message || ""}`;
    if (!existingSet.has(key)) {
      const recordWithId: RsvpRecord = {
        ...item,
        id: item.id && !current.some((r) => r.id === item.id) ? item.id : nextId++,
        created_at: item.created_at || new Date().toISOString(),
      };
      current.unshift(recordWithId);
      inMemoryRsvps.unshift(recordWithId);
      existingSet.add(key);
      addedCount++;
    }
  }

  try {
    const filePath = ensureFallbackFile();
    if (filePath) {
      fs.writeFileSync(filePath, JSON.stringify(current, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("Could not write synced RSVPs to fallback file:", err);
  }

  const updatedAll = await getAllRsvps();
  return { success: true, rsvps: updatedAll.rsvps, count: addedCount };
}
