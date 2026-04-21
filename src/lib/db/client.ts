import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/db/schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as typeof globalThis & {
  __blogDrizzle?: Db;
};

/**
 * Lazy Postgres + Drizzle client so importing modules does not throw when
 * `DATABASE_URL` is absent (e.g. static analysis). Callers must handle missing env.
 *
 * The client lives on `globalThis` so Next.js dev (Turbopack/Webpack HMR) does not
 * instantiate a second pool after a hot reload — each pool counts against Supabase
 * connection limits (FATAL 53300 when exhausted).
 */
export function getDb(): Db {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set or is empty.");
  }
  if (globalForDb.__blogDrizzle) {
    return globalForDb.__blogDrizzle;
  }

  const rawMax = Number(process.env.DATABASE_POOL_MAX ?? "1");
  const max = Math.min(10, Math.max(1, Number.isFinite(rawMax) ? Math.floor(rawMax) : 1));
  const client = postgres(connectionString, {
    max,
    prepare: false,
    idle_timeout: 10,
    connect_timeout: 30,
  });
  const dbInstance = drizzle(client, { schema });
  globalForDb.__blogDrizzle = dbInstance;
  return dbInstance;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}
