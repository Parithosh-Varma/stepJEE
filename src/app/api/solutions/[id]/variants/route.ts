import { getSolutionById } from "@/lib/steps-repository";
import { generateWithAI } from "@/lib/ai-solution-generator";
import { generateStepByStepSolution } from "@/lib/solution-generator";
import type { SolutionStep } from "@/types/solution";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function stepsMatch(a: SolutionStep[], b: SolutionStep[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((step, i) => step.detail === b[i].detail);
}

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  try {
    const solution = await getSolutionById(numericId);
    if (!solution) {
      return Response.json({ error: "Solution not found" }, { status: 404 });
    }

    const aiResult = await generateWithAI(`Solve this using a completely different approach: ${solution.problem}`);
    const generated = aiResult ?? generateStepByStepSolution(solution.problem);

    if (stepsMatch(generated.steps, solution.steps)) {
      return Response.json({ data: { sameApproach: true } });
    }

    return Response.json({ data: { steps: generated.steps, sameApproach: false } });
  } catch (error) {
    return Response.json({ error: "Failed to generate variant" }, { status: 500 });
  }
}
