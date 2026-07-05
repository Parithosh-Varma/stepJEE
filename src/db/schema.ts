import { boolean, integer, jsonb, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import type { SolutionStep } from "../types/solution";

export const stepsData = pgTable("steps_data", {
  id: serial("id").primaryKey(),
  problem: text("problem").notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  steps: jsonb("steps").$type<SolutionStep[]>().notNull(),
  image: text("image"),
  topic: varchar("topic", { length: 160 }),
  difficulty: varchar("difficulty", { length: 16 }),
  bookmarked: boolean("bookmarked").default(false).notNull(),
  hints: jsonb("hints").$type<string[]>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const topicProgress = pgTable("topic_progress", {
  id: serial("id").primaryKey(),
  subject: varchar("subject", { length: 32 }).notNull(),
  topic: varchar("topic", { length: 160 }).notNull(),
  practicedCount: integer("practiced_count").default(0).notNull(),
  confidence: integer("confidence").default(0),
  lastPracticedAt: timestamp("last_practiced_at", { withTimezone: true }).defaultNow().notNull(),
});

export const referenceFormulas = pgTable("reference_formulas", {
  id: serial("id").primaryKey(),
  subject: varchar("subject", { length: 32 }).notNull(),
  topic: varchar("topic", { length: 160 }).notNull(),
  formulaKey: varchar("formula_key", { length: 160 }).notNull(),
  formulaLatex: text("formula_latex").notNull(),
  order: integer("order").default(0).notNull(),
});

export type StepsData = typeof stepsData.$inferSelect;
export type NewStepsData = typeof stepsData.$inferInsert;
export type TopicProgress = typeof topicProgress.$inferSelect;
export type ReferenceFormula = typeof referenceFormulas.$inferSelect;
