import type { FinanceSnapshot, MonthlyBudget } from "../domain/finance";
import { getMonthKey } from "../domain/finance";
import { mockFinanceSnapshot } from "./mockFinanceData";
import { getSupabaseClient } from "../../lib/supabase";

const FALLBACK_USER_ID = "00000000-0000-0000-0000-000000000001";

interface CategoryRow {
  slug: string;
  label: string;
  color: string;
  icon: string;
}

interface TransactionRow {
  id: string;
  merchant: string;
  category_slug: string;
  amount: number;
  tags: string[] | null;
  note: string | null;
  occurred_at: string;
}

interface MonthlyBudgetRow {
  month_key: string;
  amount: number;
}

export interface CreateTransactionInput {
  merchant: string;
  categorySlug: string;
  amount: number;
  tags: string[];
  note?: string | null;
}

export interface CreateTransactionResult {
  ok: boolean;
  id?: string;
  occurredAt?: string;
  error?: string;
}

function asNumber(value: unknown): number {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function getEnvUserId(): string {
  return (import.meta.env.VITE_SUPABASE_USER_ID as string | undefined) ?? FALLBACK_USER_ID;
}

async function getActiveUserId(): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) {
    return getEnvUserId();
  }

  const userRes = await client.auth.getUser();
  if (userRes.data.user?.id) {
    return userRes.data.user.id;
  }

  const anonRes = await client.auth.signInAnonymously();
  if (anonRes.data.user?.id) {
    return anonRes.data.user.id;
  }

  return getEnvUserId();
}

async function bootstrapUserFinance(userId: string): Promise<void> {
  const client = getSupabaseClient();
  if (!client) {
    return;
  }

  await client.from("finance_categories").upsert(
    mockFinanceSnapshot.categories.map((cat) => ({
      user_id: userId,
      slug: cat.slug,
      label: cat.label,
      color: cat.color,
      icon: cat.icon,
    })),
    { onConflict: "user_id,slug" },
  );

  await client.from("finance_monthly_budgets").upsert(
    {
      user_id: userId,
      month_key: getMonthKey(),
      amount: mockFinanceSnapshot.monthlyBudget.amount,
    },
    { onConflict: "user_id,month_key" },
  );
}

async function getFinanceSnapshotInternal(bootstrapAttempted: boolean): Promise<FinanceSnapshot> {
  const client = getSupabaseClient();

  if (!client) {
    return mockFinanceSnapshot;
  }

  const monthKey = getMonthKey();
  const userId = await getActiveUserId();
  if (!userId) {
    return mockFinanceSnapshot;
  }

  const [categoriesRes, transactionsRes, budgetRes] = await Promise.all([
    client
      .from("finance_categories")
      .select("slug,label,color,icon")
      .eq("user_id", userId)
      .order("label", { ascending: true }),
    client
      .from("finance_transactions")
      .select("id,merchant,category_slug,amount,tags,note,occurred_at")
      .eq("user_id", userId)
      .order("occurred_at", { ascending: false }),
    client
      .from("finance_monthly_budgets")
      .select("month_key,amount")
      .eq("user_id", userId)
      .eq("month_key", monthKey)
      .maybeSingle(),
  ]);

  if (categoriesRes.error || transactionsRes.error || budgetRes.error) {
    return mockFinanceSnapshot;
  }

  const categoriesRows = (categoriesRes.data ?? []) as CategoryRow[];
  const transactionRows = (transactionsRes.data ?? []) as TransactionRow[];
  const monthlyBudgetRow = budgetRes.data as MonthlyBudgetRow | null;

  if (categoriesRows.length === 0 && transactionRows.length === 0 && !monthlyBudgetRow) {
    if (!bootstrapAttempted) {
      await bootstrapUserFinance(userId);
      return getFinanceSnapshotInternal(true);
    }
    return mockFinanceSnapshot;
  }

  const monthlyBudget: MonthlyBudget = monthlyBudgetRow
    ? {
        monthKey: monthlyBudgetRow.month_key,
        amount: asNumber(monthlyBudgetRow.amount),
      }
    : {
        monthKey,
        amount: mockFinanceSnapshot.monthlyBudget.amount,
      };

  return {
    categories: categoriesRows.map((row) => ({
      slug: row.slug,
      label: row.label,
      color: row.color,
      icon: row.icon,
    })),
    transactions: transactionRows.map((row) => ({
      id: row.id,
      merchant: row.merchant,
      categorySlug: row.category_slug,
      amount: asNumber(row.amount),
      tags: row.tags ?? [],
      note: row.note,
      occurredAt: row.occurred_at,
    })),
    monthlyBudget,
  };
}

export async function getFinanceSnapshot(): Promise<FinanceSnapshot> {
  return getFinanceSnapshotInternal(false);
}

export async function upsertMonthlyBudget(amount: number): Promise<void> {
  const client = getSupabaseClient();

  if (!client) {
    return;
  }

  const userId = await getActiveUserId();
  if (!userId) {
    return;
  }
  const monthKey = getMonthKey();

  await client.from("finance_monthly_budgets").upsert(
    {
      user_id: userId,
      month_key: monthKey,
      amount,
    },
    { onConflict: "user_id,month_key" },
  );
}

export async function createTransaction(
  input: CreateTransactionInput,
): Promise<CreateTransactionResult> {
  const client = getSupabaseClient();

  if (!client) {
    return {
      ok: true,
      id: `local-${Date.now()}`,
      occurredAt: new Date().toISOString(),
    };
  }

  const userId = await getActiveUserId();
  if (!userId) {
    return {
      ok: false,
      error: "No authenticated user available for database insert",
    };
  }

  const { data, error } = await client
    .from("finance_transactions")
    .insert({
      user_id: userId,
      merchant: input.merchant,
      category_slug: input.categorySlug,
      amount: input.amount,
      tags: input.tags,
      note: input.note ?? null,
      occurred_at: new Date().toISOString(),
    })
    .select("id,occurred_at")
    .single();

  if (error || !data) {
    return {
      ok: false,
      error: error?.message ?? "Unknown database error",
    };
  }

  return {
    ok: true,
    id: data.id as string,
    occurredAt: data.occurred_at as string,
  };
}
