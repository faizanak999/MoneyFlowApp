-- Replace this UUID with your authenticated user id before running.
-- Example: select auth.uid();
with seed_user as (
  select '00000000-0000-0000-0000-000000000001'::uuid as user_id
)
insert into public.finance_categories (user_id, slug, label, color, icon)
select seed_user.user_id, data.slug, data.label, data.color, data.icon
from seed_user
cross join (
  values
    ('food', 'Food & Drink', '#F4618A', 'utensils'),
    ('shopping', 'Shopping', '#CEF62E', 'shopping-bag'),
    ('transport', 'Transport', '#61A4F4', 'car'),
    ('bills', 'Bills', '#F4C761', 'zap'),
    ('housing', 'Housing', '#30E48D', 'home'),
    ('entertainment', 'Entertainment', '#C77DFF', 'gamepad'),
    ('health', 'Health', '#FF6B6B', 'heart'),
    ('education', 'Education', '#4ECDC4', 'graduation-cap'),
    ('travel', 'Travel', '#FFB86C', 'plane')
) as data(slug, label, color, icon)
on conflict (user_id, slug) do update
set label = excluded.label,
    color = excluded.color,
    icon = excluded.icon;

with seed_user as (
  select '00000000-0000-0000-0000-000000000001'::uuid as user_id
)
insert into public.finance_monthly_budgets (user_id, month_key, amount)
select seed_user.user_id, to_char(now(), 'YYYY-MM'), 3500.00
from seed_user
on conflict (user_id, month_key) do update
set amount = excluded.amount;

with seed_user as (
  select '00000000-0000-0000-0000-000000000001'::uuid as user_id
)
insert into public.finance_transactions (user_id, merchant, category_slug, amount, tags, note, occurred_at)
select seed_user.user_id, data.merchant, data.category_slug, data.amount, data.tags, data.note, data.occurred_at
from seed_user
cross join (
  values
    ('Whole Foods Market', 'food', 67.43::numeric, '{Groceries,Weekly}'::text[], null::text, now() - interval '5 hours'),
    ('Shell Gas Station', 'transport', 45.00::numeric, '{Gas,Commute}'::text[], null::text, now() - interval '8 hours'),
    ('Netflix', 'entertainment', 15.99::numeric, '{Subscription,Monthly}'::text[], null::text, now() - interval '1 day'),
    ('Chipotle', 'food', 14.85::numeric, '{Lunch,Dining Out}'::text[], null::text, now() - interval '1 day - 2 hours'),
    ('Electric Company', 'bills', 128.50::numeric, '{Utilities,Monthly}'::text[], null::text, now() - interval '2 days'),
    ('Target', 'shopping', 89.23::numeric, '{Household,Essentials}'::text[], null::text, now() - interval '2 days - 3 hours'),
    ('Rent Payment', 'housing', 1850.00::numeric, '{Rent,Monthly}'::text[], null::text, now() - interval '4 days'),
    ('Coursera', 'education', 39.00::numeric, '{Course,Learning}'::text[], null::text, now() - interval '4 days - 2 hours')
) as data(merchant, category_slug, amount, tags, note, occurred_at);
