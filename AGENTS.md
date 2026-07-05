# AGENTS.md

## Commands

| Command | Action |
|---|---|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint (flat config, Next.js core-web-vitals) |
| `npm run typecheck` | `tsc --noEmit` (sans .next output) |
| `npx drizzle-kit` | Drizzle CLI (schema at `src/db/schema.ts`) |

Run `lint -> typecheck` before committing (no test suite exists).

## Architecture

- **Next.js 16 App Router** (`src/app/`), path alias `@/*` → `./src/*`
- **DB**: PostgreSQL (Supabase-compatible) via Drizzle ORM + node-postgres. Singleton pool cached on `globalThis`.
- **Schema**: `src/db/schema.ts` — table `steps_data` (id, problem, title, steps jsonb, image, created_at, updated_at). Auto-created on first use via `ensureStepsDataTable()`.
- **Solution generation**: Rule-based in `src/lib/solution-generator.ts`. The `groq-sdk` dependency is **unused** — no AI API call is made.
- **Styling**: Tailwind CSS 4, greyscale-only, light mode, no animations.

## API

- `GET /api/health` — DB connectivity check
- `GET /api/solutions` — last 8 solutions (ordered by created_at desc)
- `POST /api/solutions` — body: `{ problem: string, image?: string }`, returns 201

## Setup

Copy `.env.example` → `.env`. Required vars: `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GROQ_API_KEY` (currently unused).

Run the SQL in `supabase/steps_data.sql` in your Supabase SQL editor to create the table with RLS policies. The app also creates the table automatically on first DB access.

## Repository quirks

- No `.gitignore` exists — add one if committing (node_modules, .next, .env).
- No test files or test framework configured.
- No CI/CD, no pre-commit hooks.
- `drizzle-kit` available but no migration history exists; table DDL is managed via raw SQL in `steps-repository.ts`.
