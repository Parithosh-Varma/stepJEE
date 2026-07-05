import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    return Response.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const cause = error instanceof Error && error.cause ? JSON.stringify(error.cause) : undefined;
    return Response.json({ ok: false, message, cause }, { status: 500 });
  }
}
