import { deleteStoredSolution, toggleBookmark, setDifficulty } from "@/lib/steps-repository";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }
  try {
    await deleteStoredSolution(numericId);
    return Response.json({ data: { deleted: true } });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Delete failed" }, { status: 500 });
  }
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if ("bookmarked" in payload) {
      const bookmarked = await toggleBookmark(numericId);
      return Response.json({ data: { bookmarked } });
    }
    if ("difficulty" in payload) {
      const difficulty = typeof payload.difficulty === "string" ? payload.difficulty : null;
      await setDifficulty(numericId, difficulty);
      return Response.json({ data: { difficulty } });
    }
    return Response.json({ error: "No supported field" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Update failed" }, { status: 500 });
  }
}
