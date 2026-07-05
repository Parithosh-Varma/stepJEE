import { getTopicProgress, upsertTopicProgress } from "@/lib/steps-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subject = searchParams.get("subject") ?? undefined;
  try {
    const data = await getTopicProgress(subject);
    return Response.json({ data });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const cause = error instanceof Error && error.cause ? JSON.stringify(error.cause) : undefined;
    return Response.json({ error: "Failed to load progress", message, cause }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let payload: { subject?: string; topic?: string };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!payload.subject || !payload.topic) {
    return Response.json({ error: "subject and topic required" }, { status: 400 });
  }
  try {
    await upsertTopicProgress(payload.subject, payload.topic);
    return Response.json({ data: { recorded: true } });
  } catch (error) {
    return Response.json({ error: "Failed to record progress" }, { status: 500 });
  }
}
