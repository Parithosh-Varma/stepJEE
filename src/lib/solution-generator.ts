import type { SolutionStep } from "@/types/solution";

const MAX_TITLE_LENGTH = 92;
const MAX_PROBLEM_LENGTH = 2000;

const domainHints = [
  {
    label: "physics",
    keywords: ["force", "velocity", "acceleration", "momentum", "kinematics", "newton", "work", "energy", "power", "torque", "circuit", "resistance", "capacitor", "lens", "mirror", "optics", "wave", "frequency", "amplitude", "thermodynamics", "entropy", "electrostatics", "gauss", "magnetic", "faraday", "induction", "modern physics", "photoelectric", "nuclear", "kinetic theory", "shm", "simple harmonic", "fluid", "bernoulli", "gravitation", "satellite"],
    method: "Identify the physical principles involved, list known and unknown quantities, write the relevant equations, substitute values with consistent units, and solve algebraically before computing the numeric answer.",
  },
  {
    label: "chemistry",
    keywords: ["mole", "molarity", "molality", "equilibrium", "rate", "reaction", "organic", "inorganic", "periodic", "hybridisation", "resonance", "aromatic", "electrophile", "nucleophile", "redox", "electrochemistry", "thermochemistry", "enthalpy", "entropy", "gibbs", "atomic", "molecular", "crystal", "coordination", "isomerism", "polymer", "biomolecule", "gas law", "solution", "colligative"],
    method: "Write the balanced chemical equation, identify the reactants and products, determine the limiting reagent if applicable, apply stoichiometric relationships, and compute the required quantity with correct significant figures and units.",
  },
  {
    label: "mathematics",
    keywords: ["integral", "derivative", "differentiate", "integrate", "matrix", "determinant", "vector", "probability", "permutation", "combination", "binomial", "sequence", "series", "limit", "continuity", "differentiability", "function", "domain", "range", "trigonometry", "geometry", "coordinate", "parabola", "ellipse", "hyperbola", "circle", "straight line", "complex number", "differential equation", "area", "volume", "maxima", "minima", "tangent", "normal"],
    method: "Clearly define variables, write the governing equations or expressions, simplify step by step using algebraic manipulation or calculus rules, and verify the solution by substituting back or checking boundary conditions.",
  },
];

export function normalizeProblem(input: string) {
  return input.replace(/\s+/g, " ").trim().slice(0, MAX_PROBLEM_LENGTH);
}

export function generateStepByStepSolution(problemInput: string): { title: string; steps: SolutionStep[] } {
  const problem = normalizeProblem(problemInput);
  const clauses = extractClauses(problem);
  const hint = findDomainHint(problem);
  const computedMath = tryEvaluateSimpleArithmetic(problem);

  const title = buildTitle(problem, hint.label);
  const subproblemText = clauses.length
    ? clauses.map((clause, index) => `${index + 1}. ${clause}`).join(" ")
    : "Treat the request as one main outcome and avoid adding extra assumptions.";

  const steps: SolutionStep[] = [
    {
      order: 1,
      heading: "Restate the task",
      detail: `Work on this exact problem: “${problem}”. Keep the wording visible so each step answers the submitted task rather than a different version of it.`,
    },
    {
      order: 2,
      heading: "Identify the goal and constraints",
      detail: `The goal is to produce a usable answer for a ${hint.label} task. Note any numbers, requirements, deadlines, formats, or conditions in the prompt before deciding what to do.`,
    },
    {
      order: 3,
      heading: "Break it into ordered parts",
      detail: `Handle the work in this order: ${subproblemText}`,
    },
    {
      order: 4,
      heading: "Apply the method",
      detail: computedMath ?? hint.method,
    },
    {
      order: 5,
      heading: "Check the result",
      detail: "Compare the result against the original wording. Confirm that every required part is answered, no condition is ignored, and the final response is simple enough to act on.",
    },
    {
      order: 6,
      heading: "Final response",
      detail: "Present the answer in a direct sequence: conclusion first, then the supporting steps or evidence. If more information is needed, ask only for the missing fact that blocks completion.",
    },
  ];

  return { title, steps };
}

function buildTitle(problem: string, label: string) {
  const compact = problem.replace(/[\r\n]+/g, " ").trim();
  const prefix = label === "general" ? "Step solution" : `${capitalize(label)} solution`;
  const titleBody = compact.length > MAX_TITLE_LENGTH ? `${compact.slice(0, MAX_TITLE_LENGTH - 1)}…` : compact;
  return `${prefix}: ${titleBody}`;
}

function extractClauses(problem: string) {
  return problem
    .split(/(?:\n+|[.;?!]|,\s+(?=and|then|but|so|with|for))/i)
    .map((part) => part.trim())
    .filter((part) => part.length > 3)
    .slice(0, 5);
}

function findDomainHint(problem: string) {
  const lower = problem.toLowerCase();
  return (
    domainHints.find((hint) => hint.keywords.some((keyword) => lower.includes(keyword))) ?? {
      label: "general",
      method: "Use the facts from the prompt, make one decision at a time, and keep each conclusion tied to a stated reason.",
    }
  );
}

function tryEvaluateSimpleArithmetic(problem: string) {
  const expressionMatch = problem.match(/[-+*/().\d\s]{3,}/);
  if (!expressionMatch) {
    return null;
  }

  const expression = expressionMatch[0].trim();
  if (!/\d/.test(expression) || !/^[\d\s()+\-*/.]+$/.test(expression)) {
    return null;
  }

  try {
    const result = Function(`"use strict"; return (${expression});`)() as unknown;
    if (typeof result !== "number" || !Number.isFinite(result)) {
      return null;
    }

    const rounded = Number.isInteger(result) ? result.toString() : result.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
    return `Compute the arithmetic expression ${expression} carefully from left to right while respecting parentheses and operator precedence. The calculated result is ${rounded}.`;
  } catch {
    return null;
  }
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
