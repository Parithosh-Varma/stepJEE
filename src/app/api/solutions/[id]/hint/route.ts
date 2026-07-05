import { getHint } from "@/lib/steps-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }
  const { searchParams } = new URL(request.url);
  const hintIndex = Number(searchParams.get("index") ?? "0");
  try {
    const detail = await getHint(numericId, hintIndex);
    if (!detail) return Response.json({ error: "No more hints" }, { status: 404 });
    return Response.json({ data: { hint: detail, index: hintIndex } });
  } catch (error) {
    return Response.json({ error: "Hint failed" }, { status: 500 });
  }
}
