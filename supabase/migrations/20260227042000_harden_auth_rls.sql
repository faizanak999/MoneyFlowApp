-- Audit current RLS policies for finance tables
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'finance_categories',
    'finance_monthly_budgets',
    'finance_transactions',
    'finance_ai_messages'
  )
order by tablename, policyname;

-- Ensure RLS is enabled
alter table public.finance_categories enable row level security;
alter table public.finance_monthly_budgets enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.finance_ai_messages enable row level security;

-- Remove any permissive/legacy policies
-- Categories
drop policy if exists "categories own rows" on public.finance_categories;
drop policy if exists "categories own rows strict" on public.finance_categories;
drop policy if exists "categories anon" on public.finance_categories;

-- Budgets
drop policy if exists "budgets own rows" on public.finance_monthly_budgets;
drop policy if exists "budgets own rows strict" on public.finance_monthly_budgets;
drop policy if exists "budgets anon" on public.finance_monthly_budgets;

-- Transactions
drop policy if exists "transactions own rows" on public.finance_transactions;
drop policy if exists "transactions own rows strict" on public.finance_transactions;
drop policy if exists "transactions anon" on public.finance_transactions;

-- AI messages
drop policy if exists "ai messages own rows" on public.finance_ai_messages;
drop policy if exists "ai messages own rows strict" on public.finance_ai_messages;
drop policy if exists "ai messages anon" on public.finance_ai_messages;

-- Strict owner-only policies
create policy "categories own rows strict"
  on public.finance_categories
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "budgets own rows strict"
  on public.finance_monthly_budgets
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "transactions own rows strict"
  on public.finance_transactions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "ai messages own rows strict"
  on public.finance_ai_messages
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
