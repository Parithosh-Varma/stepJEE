import { generateWithAI } from "@/lib/ai-solution-generator";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: { problem?: string; userAnswer?: string };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload.problem || !payload.userAnswer) {
    return Response.json({ error: "problem and userAnswer required" }, { status: 400 });
  }

  try {
    const prompt = `Compare the user's answer with the correct solution for this problem.

Problem: ${payload.problem}
User's answer: ${payload.userAnswer}

Provide brief feedback: Is the user's answer correct, partially correct, or incorrect? What's missing? Keep it concise.`;
    const result = await generateWithAI(prompt);
    const feedback = result?.steps?.[0]?.detail ?? "Could not verify. Try rephrasing your answer.";
    return Response.json({ data: { feedback } });
  } catch {
    return Response.json({ error: "Verification failed" }, { status: 500 });
  }
}
