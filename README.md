# MoneyFlowApp (FinFlow)

Mobile-first personal finance tracker built with React + Vite.

## Run locally

```bash
npm i
npm run dev
```

## Supabase setup (Step 1 + 2)

This repo now includes:

- Schema migration: `supabase/migrations/20260227010000_init_finance.sql`
- Seed script: `supabase/seed.sql`
- Shared data layer: `src/app/data/financeRepository.ts`

### 1) Create Supabase project

Create a project at [supabase.com](https://supabase.com), then copy:

- Project URL
- `anon` public API key

Also enable anonymous sign-in in Supabase:

- `Authentication -> Providers -> Anonymous -> Enable`

### 2) Set env vars

Create `.env.local`:

```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_public_anon_key
# Optional fallback only:
# VITE_SUPABASE_USER_ID=your_user_uuid
```

`VITE_SUPABASE_USER_ID` is optional and only used as a fallback if no auth user is available.

### 3) Run migration + seed

Run the SQL from:

- `supabase/migrations/20260227010000_init_finance.sql`
- `supabase/seed.sql`

in Supabase SQL editor.

## Notes

- If Supabase env/config is missing, the app falls back to local mock snapshot data.
- Home, Ledger, and Reports now read from the shared finance repository instead of inline constants.

## AI analyze endpoint (Step 4 partial)

- Vercel function route: `api/ai/analyze.ts`
- Required server env var (Vercel project settings):

```bash
GEMINI_API_KEY=your_gemini_api_key
# Optional:
GEMINI_MODEL=gemini-2.0-flash
```

Quick Add calls `/api/ai/analyze` first and falls back to local parsing if AI is unavailable or low-confidence.
