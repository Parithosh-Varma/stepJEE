import { setConfidence } from "@/lib/steps-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: { subject?: string; topic?: string; confidence?: number };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!payload.subject || !payload.topic || typeof payload.confidence !== "number") {
    return Response.json({ error: "subject, topic, and confidence required" }, { status: 400 });
  }
  try {
    await setConfidence(payload.subject, payload.topic, payload.confidence);
    return Response.json({ data: { confidence: payload.confidence } });
  } catch (error) {
    return Response.json({ error: "Failed to set confidence" }, { status: 500 });
  }
}
