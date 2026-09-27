import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { loadEnvConfig } from "@next/env";

// Next loads .env automatically for the app, but standalone scripts such as
// `tsx db/seeds/index.ts` need the same bootstrap explicitly.
loadEnvConfig(process.cwd());

const connectionString = process.env.DATABASE_URL?.trim().replace(/^['"]|['"]$/g, "");

if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  cibionePostgresClient?: ReturnType<typeof postgres>;
};

export const client = globalForDb.cibionePostgresClient ?? postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 30,
  max_lifetime: 60 * 30,
  keep_alive: 60,
  prepare: false,
  onnotice: () => {},
});

if (process.env.NODE_ENV !== "production") {
  globalForDb.cibionePostgresClient = client;
}

export const db = drizzle(client);
