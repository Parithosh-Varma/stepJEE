import { getFormulas } from "@/lib/steps-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subject = searchParams.get("subject");
  const topic = searchParams.get("topic");
  if (!subject || !topic) {
    return Response.json({ error: "subject and topic required" }, { status: 400 });
  }
  try {
    const data = await getFormulas(subject, topic);
    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: "Failed to load formulas" }, { status: 500 });
  }
}
