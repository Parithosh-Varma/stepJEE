import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

function createPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const globalForDb = globalThis as typeof globalThis & {
    __arenaNextJsPostgresqlPool?: Pool;
  };

  globalForDb.__arenaNextJsPostgresqlPool ??= new Pool({
    connectionString: databaseUrl,
  });

  return globalForDb.__arenaNextJsPostgresqlPool;
}

let lazyPool: Pool | null = null;
function getPool(): Pool {
  lazyPool ??= createPool();
  return lazyPool;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_, prop) {
    return (drizzle(getPool()) as any)[prop];
  },
});
