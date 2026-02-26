create extension if not exists pgcrypto;

create table if not exists public.finance_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  slug text not null,
  label text not null,
  color text not null,
  icon text not null,
  created_at timestamptz not null default now(),
  unique (user_id, slug)
);

create table if not exists public.finance_monthly_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  month_key text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month_key)
);

create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  merchant text not null,
  category_slug text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  tags text[] not null default '{}',
  note text,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.finance_ai_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists finance_tx_user_date_idx
  on public.finance_transactions (user_id, occurred_at desc);

create index if not exists finance_tx_user_category_idx
  on public.finance_transactions (user_id, category_slug);

create index if not exists finance_ai_user_date_idx
  on public.finance_ai_messages (user_id, created_at desc);

alter table public.finance_categories enable row level security;
alter table public.finance_monthly_budgets enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.finance_ai_messages enable row level security;

drop policy if exists "categories own rows" on public.finance_categories;
create policy "categories own rows"
  on public.finance_categories
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "budgets own rows" on public.finance_monthly_budgets;
create policy "budgets own rows"
  on public.finance_monthly_budgets
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "transactions own rows" on public.finance_transactions;
create policy "transactions own rows"
  on public.finance_transactions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "ai messages own rows" on public.finance_ai_messages;
create policy "ai messages own rows"
  on public.finance_ai_messages
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_budget_updated_at on public.finance_monthly_budgets;

create trigger set_budget_updated_at
before update on public.finance_monthly_budgets
for each row execute function public.set_updated_at();
