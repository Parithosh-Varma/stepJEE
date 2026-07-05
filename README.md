<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/Parithosh-Varma/stepJEE/main/public/favicon.svg">
    <img src="https://raw.githubusercontent.com/Parithosh-Varma/stepJEE/main/public/favicon.svg" alt="stepJEE" width="64">
  </picture>
</p>

<h1 align="center">stepJEE</h1>

<p align="center">
  <strong>Step-by-step AI-powered solutions for JEE Mathematics, Physics, and Chemistry.</strong>
  <br>
  Greyscale · LaTeX · Ionic-inspired UI · Dark mode · PWA
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16">
  <img src="https://img.shields.io/badge/PostgreSQL-Supabase-3fcf8e?logo=supabase" alt="Supabase">
  <img src="https://img.shields.io/badge/Groq-LLaMA_4_Scout-10a37f?logo=groq" alt="Groq">
  <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?logo=drizzle" alt="Drizzle ORM">
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?logo=tailwindcss" alt="Tailwind CSS v4">
  <img src="https://img.shields.io/badge/KaTeX-008958?logo=katex" alt="KaTeX">
</p>

---

## Features

### Core
- **AI solution generation** via Groq (LLaMA 4 Scout 17B) — outputs pure LaTeX step-by-step
- **Image input** — paste or upload problem images
- **LaTeX rendering** with KaTeX (loaded from `public/`, no server-side crash)
- **Graph support** — `\graph{...}` commands render interactive function plots
- **Topic pages** — 117 JEE chapters across Physics (25), Maths (46), Chemistry (46)
- **Topic-scoped history** — each chapter stores and shows only its own solutions

### Learning & Practice
- **Hint button** — reveals one step at a time as a progressive nudge
- **Solution variants** — generates alternative approaches to the same problem
- **Difficulty tags** — mark solutions as easy / medium / hard
- **Step-by-step verification** — type your own answer and let AI check it
- **Topic-wise progress tracker** — records practice count per chapter
- **Reference formulas** — per-chapter formula sidebar (populate via `reference_formulas` table)
- **Random problem generator** — jumps to a random JEE topic

### User Experience
- **Search** — full-text search across all saved solutions
- **Bookmark / star** — favorite important solutions
- **Export & Share** — download as HTML or use the native share API
- **Dark mode** — ☾/☀ toggle persisted in localStorage
- **Mobile PWA** — installable on phones via `manifest.json`
- **Ionic-inspired UI** — clean card-based layout with proper toolbar, list items, and buttons
- **Fully responsive** — optimized for both mobile and desktop

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (class-based dark mode) |
| Database | PostgreSQL (Supabase-compatible) via Drizzle ORM |
| AI | Groq SDK (LLaMA 4 Scout 17B 16E Instruct) |
| LaTeX | KaTeX (client-side only) |
| Graphs | function-plot |
| PWA | Web app manifest |
| Deployment | Ready for Netlify / Vercel |

---

## Getting Started

### Prerequisites
- Node.js >= 20
- PostgreSQL database (local or Supabase)
- Groq API key

### Setup

```bash
git clone https://github.com/Parithosh-Varma/stepJEE.git
cd stepJEE
cp .env.example .env
npm install
```

Fill in your `.env`:

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GROQ_API_KEY=gsk_...
```

### Database

Run the SQL in `supabase/steps_data.sql` in your Supabase SQL editor. This creates all required tables and policies. The app can also auto-create them on first database access.

### Development

```bash
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

---

## Architecture

```
src/
├── app/
│   ├── api/
│   │   ├── solutions/        # CRUD + search + hints + variants
│   │   ├── topics/           # progress + confidence
│   │   ├── formulas/         # reference formulas
│   │   └── verify/           # answer verification
│   ├── physics/              # topic listing + [slug] pages
│   ├── maths/                # topic listing + [slug] pages
│   ├── chemistry/            # topic listing + [slug] pages
│   └── page.tsx              # home (global solver)
├── components/               # all UI components
├── db/                       # Drizzle schema + connection
├── lib/                      # solution generator, AI client, repository
└── types/                    # shared TypeScript types
```

---

## Deployment

The app is ready for **Netlify** or **Vercel**. Set the four environment variables (`DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GROQ_API_KEY`) in your hosting dashboard.

No special build configuration is needed — the database connection uses a lazy Proxy pattern so the build won't fail even without `DATABASE_URL`.

---

## License

MIT
