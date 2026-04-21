import { loadEnvConfig } from "@next/env";
import type { Config } from "drizzle-kit";

// Same .env / .env.local resolution as Next.js (CLI does not load them by default).
const projectDir = process.cwd();
loadEnvConfig(projectDir, process.env.NODE_ENV !== "production");

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is missing or empty. Add it to .env.local (or .env) in the project root — " +
      "Supabase: Project Settings → Database → Connection string (URI). " +
      "Then run drizzle-kit again.",
  );
}

/**
 * Drizzle Kit introspection against Supabase often hangs on Windows/networks if SSL
 * is implicit only; `sslmode=require` + `connect_timeout` avoids indefinite waits.
 */
function normalizeDrizzleKitDatabaseUrl(urlStr: string): string {
  try {
    const normalized = urlStr.replace(/^postgres:\/\//i, "postgresql://");
    const u = new URL(normalized);
    if (!u.searchParams.has("sslmode")) {
      u.searchParams.set("sslmode", "require");
    }
    if (!u.searchParams.has("connect_timeout")) {
      u.searchParams.set("connect_timeout", "30");
    }
    return u.toString();
  } catch {
    const sep = urlStr.includes("?") ? "&" : "?";
    return `${urlStr}${sep}sslmode=require&connect_timeout=30`;
  }
}

const config: Config = {
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  verbose: process.env.DRIZZLE_VERBOSE === "1",
  // Avoids long / stuck role introspection on hosted Supabase projects.
  entities: {
    roles: { provider: "supabase" },
  },
  dbCredentials: {
    url: normalizeDrizzleKitDatabaseUrl(databaseUrl),
  },
};

export default config;
