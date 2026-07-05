import { searchSolutions } from "@/lib/steps-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 1) {
    return Response.json({ data: [] });
  }
  try {
    const results = await searchSolutions(q);
    return Response.json({ data: results });
  } catch (error) {
    return Response.json({ error: "Search failed" }, { status: 500 });
  }
}
