import { createStoredSolution, getRecentSolutions } from "@/lib/steps-repository";
import type { SolutionPayload } from "@/types/solution";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic") ?? undefined;
    const solutions = await getRecentSolutions(undefined, topic);
    return Response.json({ data: solutions });
  } catch (error) {
    console.error("Failed to load solutions", error);
    return Response.json({ error: "Saved solutions could not be loaded." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let payload: Partial<SolutionPayload>;

  try {
    payload = (await request.json()) as Partial<SolutionPayload>;
  } catch {
    return Response.json({ error: "Submit a valid JSON request." }, { status: 400 });
  }

  const hasImage = typeof payload.image === "string" && payload.image.length > 0;
  const problem = typeof payload.problem === "string" ? payload.problem.trim() : "";
  const topic = typeof payload.topic === "string" ? payload.topic.trim() : undefined;

  if (problem.length < 3 && !hasImage) {
    return Response.json({ error: "Enter a problem or upload an image." }, { status: 400 });
  }

  if (payload.image !== undefined && payload.image !== null && typeof payload.image !== "string") {
    return Response.json({ error: "Image must be a base64 data URL string." }, { status: 400 });
  }

  try {
    const solution = await createStoredSolution(problem || "Solve the problem from the image", payload.image ?? null, topic);
    return Response.json({ data: solution }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The solution could not be generated.";
    console.error("Failed to create solution", error);
    return Response.json({ error: message }, { status: 500 });
  }
}
