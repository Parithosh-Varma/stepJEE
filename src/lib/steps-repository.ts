import { db } from "@/db";
import { stepsData, topicProgress, referenceFormulas, type StepsData } from "@/db/schema";
import { generateStepByStepSolution, normalizeProblem } from "@/lib/solution-generator";
import { generateWithAI } from "@/lib/ai-solution-generator";
import type { SolutionRecord, SolutionStep } from "@/types/solution";
import { desc, eq, sql, and, like, or } from "drizzle-orm";

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 25;
const MIN_PROBLEM_LENGTH = 3;
const MAX_PROBLEM_LENGTH = 2000;

let ensureTablePromise: Promise<void> | null = null;

export async function ensureStepsDataTable() {
  ensureTablePromise ??= db.execute(sql`
    create table if not exists steps_data (
      id serial primary key,
      problem text not null,
      title varchar(160) not null,
      steps jsonb not null,
      image text,
      topic varchar(160),
      difficulty varchar(16),
      bookmarked boolean not null default false,
      hints jsonb,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      constraint steps_data_steps_array check (jsonb_typeof(steps) = 'array')
    )
  `).then(async () => {
    await db.execute(sql`ALTER TABLE steps_data ADD COLUMN IF NOT EXISTS image text`);
    await db.execute(sql`ALTER TABLE steps_data ADD COLUMN IF NOT EXISTS topic varchar(160)`);
    await db.execute(sql`ALTER TABLE steps_data ADD COLUMN IF NOT EXISTS difficulty varchar(16)`);
    await db.execute(sql`ALTER TABLE steps_data ADD COLUMN IF NOT EXISTS bookmarked boolean not null default false`);
    await db.execute(sql`ALTER TABLE steps_data ADD COLUMN IF NOT EXISTS hints jsonb`);
  }).then(async () => {
    await db.execute(sql`
      create table if not exists topic_progress (
        id serial primary key,
        subject varchar(32) not null,
        topic varchar(160) not null,
        practiced_count integer not null default 0,
        confidence integer default 0,
        last_practiced_at timestamptz not null default now(),
        unique(subject, topic)
      )
    `);
  }).then(async () => {
    await db.execute(sql`
      create table if not exists reference_formulas (
        id serial primary key,
        subject varchar(32) not null,
        topic varchar(160) not null,
        formula_key varchar(160) not null,
        formula_latex text not null,
        "order" integer not null default 0
      )
    `);
  });

  return ensureTablePromise;
}

export async function getRecentSolutions(limit = DEFAULT_LIMIT, topic?: string): Promise<SolutionRecord[]> {
  await ensureStepsDataTable();
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), MAX_LIMIT);
  const query = db.select().from(stepsData).orderBy(desc(stepsData.createdAt)).limit(safeLimit);
  const rows = topic
    ? await query.where(sql`${stepsData.topic} = ${topic}`)
    : await query;
  return rows.map(toSolutionRecord);
}

export async function getSolutionById(id: number): Promise<SolutionRecord | null> {
  await ensureStepsDataTable();
  const [row] = await db.select().from(stepsData).where(eq(stepsData.id, id)).limit(1);
  return row ? toSolutionRecord(row) : null;
}

export async function createStoredSolution(problemInput: string, image?: string | null, topic?: string): Promise<SolutionRecord> {
  await ensureStepsDataTable();

  const problem = normalizeProblem(problemInput);
  const hasImage = typeof image === "string" && image.length > 0;

  if (problem.length < MIN_PROBLEM_LENGTH && !hasImage) {
    throw new Error("Please enter a problem or upload an image.");
  }

  if (problem.length > MAX_PROBLEM_LENGTH) {
    throw new Error("Please keep the problem under 2,000 characters.");
  }

  const aiResult = await generateWithAI(problem, image);
  const generated = aiResult ?? generateStepByStepSolution(problem);
  const [row] = await db
    .insert(stepsData)
    .values({
      problem,
      title: generated.title,
      steps: generated.steps,
      image: image ?? null,
      topic: topic ?? null,
    })
    .returning();

  if (!row) {
    throw new Error("The solution could not be saved.");
  }

  return toSolutionRecord(row);
}

export async function deleteStoredSolution(id: number): Promise<void> {
  await ensureStepsDataTable();
  await db.delete(stepsData).where(sql`${stepsData.id} = ${id}`);
}

export async function toggleBookmark(id: number): Promise<boolean> {
  await ensureStepsDataTable();
  const [row] = await db.select({ bookmarked: stepsData.bookmarked }).from(stepsData).where(eq(stepsData.id, id)).limit(1);
  if (!row) throw new Error("Solution not found");
  const newVal = !row.bookmarked;
  await db.update(stepsData).set({ bookmarked: newVal }).where(eq(stepsData.id, id));
  return newVal;
}

export async function setDifficulty(id: number, difficulty: string | null): Promise<void> {
  await ensureStepsDataTable();
  await db.update(stepsData).set({ difficulty }).where(eq(stepsData.id, id));
}

export async function getHint(id: number, hintIndex: number): Promise<string | null> {
  await ensureStepsDataTable();
  const [row] = await db.select({ steps: stepsData.steps }).from(stepsData).where(eq(stepsData.id, id)).limit(1);
  if (!row) return null;
  const steps = row.steps as SolutionStep[];
  if (hintIndex < steps.length) {
    return steps[hintIndex].detail;
  }
  return null;
}

export async function searchSolutions(q: string): Promise<SolutionRecord[]> {
  await ensureStepsDataTable();
  const pattern = `%${q}%`;
  const rows = await db
    .select()
    .from(stepsData)
    .where(
      or(
        like(stepsData.problem, pattern),
        like(stepsData.title, pattern),
        like(stepsData.topic, pattern),
      ),
    )
    .orderBy(desc(stepsData.createdAt))
    .limit(20);
  return rows.map(toSolutionRecord);
}

export async function getTopicProgress(subject?: string): Promise<Array<{ subject: string; topic: string; practicedCount: number; confidence: number | null; lastPracticedAt: string }>> {
  await ensureStepsDataTable();
  const where = subject ? eq(topicProgress.subject, subject) : undefined;
  const rows = where
    ? await db.select().from(topicProgress).where(where).orderBy(topicProgress.topic)
    : await db.select().from(topicProgress).orderBy(topicProgress.topic);
  return rows.map((r) => ({
    subject: r.subject,
    topic: r.topic,
    practicedCount: r.practicedCount,
    confidence: r.confidence,
    lastPracticedAt: r.lastPracticedAt.toISOString(),
  }));
}

export async function upsertTopicProgress(subject: string, topic: string): Promise<void> {
  await ensureStepsDataTable();
  const existing = await db
    .select()
    .from(topicProgress)
    .where(and(eq(topicProgress.subject, subject), eq(topicProgress.topic, topic)))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(topicProgress)
      .set({
        practicedCount: sql`${topicProgress.practicedCount} + 1`,
        lastPracticedAt: sql`now()`,
      })
      .where(and(eq(topicProgress.subject, subject), eq(topicProgress.topic, topic)));
  } else {
    await db.insert(topicProgress).values({ subject, topic, practicedCount: 1, confidence: 0 });
  }
}

export async function setConfidence(subject: string, topic: string, confidence: number): Promise<void> {
  await ensureStepsDataTable();
  await db
    .update(topicProgress)
    .set({ confidence })
    .where(and(eq(topicProgress.subject, subject), eq(topicProgress.topic, topic)));
}

export async function getFormulas(subject: string, topic: string): Promise<Array<{ formulaKey: string; formulaLatex: string }>> {
  await ensureStepsDataTable();
  const rows = await db
    .select()
    .from(referenceFormulas)
    .where(and(eq(referenceFormulas.subject, subject), eq(referenceFormulas.topic, topic)))
    .orderBy(referenceFormulas.order);
  return rows.map((r) => ({ formulaKey: r.formulaKey, formulaLatex: r.formulaLatex }));
}

function toSolutionRecord(row: StepsData): SolutionRecord {
  return {
    id: row.id,
    problem: row.problem,
    title: row.title,
    steps: normalizeSteps(row.steps),
    image: row.image ?? null,
    topic: row.topic ?? null,
    difficulty: row.difficulty ?? null,
    bookmarked: row.bookmarked ?? false,
    hints: row.hints ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

function normalizeSteps(value: unknown): SolutionStep[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((step, index) => {
      if (!step || typeof step !== "object") return null;
      const candidate = step as Partial<SolutionStep>;
      return {
        order: typeof candidate.order === "number" ? candidate.order : index + 1,
        heading: typeof candidate.heading === "string" ? candidate.heading : `Step ${index + 1}`,
        detail: typeof candidate.detail === "string" ? candidate.detail : "Review this step and continue to the next action.",
      } satisfies SolutionStep;
    })
    .filter((step): step is SolutionStep => step !== null);
}
