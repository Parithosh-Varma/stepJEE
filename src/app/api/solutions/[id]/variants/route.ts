import { getHint } from "@/lib/steps-repository";
import { generateWithAI } from "@/lib/ai-solution-generator";
import { generateStepByStepSolution } from "@/lib/solution-generator";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const hint = await getHint(numericId, 0);
    if (!hint) {
      return Response.json({ error: "Solution not found" }, { status: 404 });
    }

    // Generate a variant by asking AI for a different approach
    const aiResult = await generateWithAI(`Solve this differently: ${hint}`);
    const generated = aiResult ?? generateStepByStepSolution(hint);

    return Response.json({ data: { steps: generated.steps } });
  } catch (error) {
    return Response.json({ error: "Failed to generate variant" }, { status: 500 });
  }
}
