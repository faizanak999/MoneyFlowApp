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

Enable email auth in Supabase:

- `Authentication -> Providers -> Email -> Enable`

### 2) Set env vars

Create `.env.local`:

```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_public_anon_key
```

### 3) Run migration + seed

Run the SQL from:

- `supabase/migrations/20260227010000_init_finance.sql`
- `supabase/seed.sql`

in Supabase SQL editor.

## Notes

- If Supabase env/config is missing, auth/data access is unavailable until env vars are configured.
- Home, Ledger, and Reports now read from the shared finance repository instead of inline constants.

## AI endpoints

- Vercel function routes:
  - `api/ai/analyze.ts` for quick-add extraction/categorization
  - `api/ai/chat.ts` for assistant Q&A over your finance context
- Required server env var (Vercel project settings):

```bash
GEMINI_API_KEY=your_gemini_api_key
# Optional:
GEMINI_MODEL=gemini-2.0-flash
# Feature flag:
# VITE_ENABLE_AI=false
```

Quick Add calls `/api/ai/analyze` first and falls back to local parsing if AI is unavailable or low-confidence.
Assistant calls `/api/ai/chat` and answers based on current finance context.

## Authentication flow

- App now requires user login (`/auth`) before accessing finance screens.
- Sign-up and sign-in use Supabase email/password auth.
- All DB reads/writes run under authenticated `auth.uid()` to match strict RLS.

## Security hardening

After deploying auth:

1. Disable anonymous auth provider in Supabase.
2. Run this migration in Supabase SQL editor:
   - `supabase/migrations/20260227042000_harden_auth_rls.sql`
