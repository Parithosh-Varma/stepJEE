import Groq from "groq-sdk";
import type { SolutionStep } from "@/types/solution";

const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

export type AIResult = {
  title: string;
  steps: SolutionStep[];
};

let groqClient: Groq | null = null;

function getGroqClient(): Groq | null {
  if (groqClient) return groqClient;
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;
  groqClient = new Groq({ apiKey });
  return groqClient;
}

const ERROR_PATTERNS = [/does not support image/i, /cannot read/i, /image input/i];

function isErrorContent(text: string): boolean {
  return ERROR_PATTERNS.some((p) => p.test(text));
}

function buildSystemPrompt(): string {
  return `You are an expert JEE (IIT-JEE) solver. Given a problem (as text and/or image), output ONLY step-by-step mathematical equations with NO words, NO explanations, NO sentences.

STRICT RULES:
- Output ONLY numbered steps, each step is one or more LaTeX equations.
- NEVER write English words, sentences, or explanations.
- Use $$...$$ for every equation.
- Use proper LaTeX: \\frac, \\sin, \\cos, \\tan, \\log, \\ln, \\int, \\sum, \\prod, \\lim, \\infty, \\pi, \\sqrt, \\boxed, \\text, \\Rightarrow, \\rightarrow, \\cdot, \\times, \\partial, \\nabla, \\geq, \\leq, \\neq, \\approx, \\alpha, \\beta, \\theta, \\Delta
- Final step must end with $$\\boxed{answer}$$

When a problem involves graphing, plotting, parabolas, curves, inequalities with regions, or functions where a visual helps, add a graph step using:
\\graph{y = x^2}
\\graph{y = sin(x), y = cos(x), y = x + 1}

Place \\graph{...} in its own step's detail field. Do NOT wrap it in $$...$$.

Example for "Find derivative of x^3 sin(x)":
$$f(x) = x^3 \\sin(x)$$
$$f'(x) = \\frac{d}{dx}(x^3 \\sin(x))$$
$$f'(x) = \\frac{d}{dx}(x^3) \\cdot \\sin(x) + x^3 \\cdot \\frac{d}{dx}(\\sin(x))$$
$$f'(x) = 3x^2 \\sin(x) + x^3 \\cos(x)$$
$$\\boxed{f'(x) = 3x^2 \\sin(x) + x^3 \\cos(x)}$$

Respond with valid JSON:
{
  "title": "short problem name",
  "steps": [
    { "order": 1, "heading": "", "detail": "$$equation1$$\\n$$equation2$$" }
  ]
}

- heading is always empty string ""
- detail contains ONLY LaTeX equations inside $$...$$
- Separate multiple equations in a step with \\n`;
}

async function callGroq(client: Groq, messages: Groq.Chat.Completions.ChatCompletionMessageParam[]): Promise<AIResult | null> {
  const completion = await client.chat.completions.create({
    model: MODEL,
    messages,
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 4096,
  });

  const content = completion.choices?.[0]?.message?.content;
  if (!content) return null;

  const parsed = JSON.parse(content) as AIResult;
  if (!parsed.title || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
    return null;
  }

  if (parsed.steps.some((s) => isErrorContent(s.detail))) {
    return null;
  }

  parsed.steps = parsed.steps
    .filter((s) => s.detail)
    .map((s, i) => ({
      order: typeof s.order === "number" ? s.order : i + 1,
      heading: s.heading ?? "",
      detail: s.detail,
    }));

  if (parsed.steps.length === 0) return null;

  return parsed;
}

export async function generateWithAI(problem: string, image?: string | null): Promise<AIResult | null> {
  const client = getGroqClient();
  if (!client) return null;

  const systemPrompt = buildSystemPrompt();

  try {
    if (image) {
      try {
        const result = await callGroq(client, [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: problem || "Solve the problem shown in the image." },
              { type: "image_url", image_url: { url: image } },
            ],
          },
        ]);
        if (result) return result;
      } catch {
        // image call failed, fall through to text-only
      }

      // Retry with text-only
      const result = await callGroq(client, [
        { role: "system", content: systemPrompt },
        { role: "user", content: problem || "Solve the problem shown in the image." },
      ]);
      return result;
    }

    const result = await callGroq(client, [
      { role: "system", content: systemPrompt },
      { role: "user", content: problem },
    ]);
    return result;
  } catch {
    return null;
  }
}
