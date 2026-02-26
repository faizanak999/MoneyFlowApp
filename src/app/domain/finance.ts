export interface FinanceCategory {
  slug: string;
  label: string;
  color: string;
  icon: string;
}

export interface FinanceTransaction {
  id: string;
  merchant: string;
  categorySlug: string;
  amount: number;
  tags: string[];
  note: string | null;
  occurredAt: string;
}

export interface MonthlyBudget {
  monthKey: string;
  amount: number;
}

export interface FinanceSnapshot {
  categories: FinanceCategory[];
  transactions: FinanceTransaction[];
  monthlyBudget: MonthlyBudget;
}

export interface CategorySpend {
  slug: string;
  label: string;
  color: string;
  value: number;
}

export interface MonthPoint {
  monthKey: string;
  month: string;
  amount: number;
}

export interface DayPoint {
  day: string;
  amount: number;
}

export function getMonthKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function parseTransactionDate(occurredAt: string): Date {
  return new Date(occurredAt);
}

export function isSameMonth(date: Date, monthKey: string): boolean {
  return getMonthKey(date) === monthKey;
}

export function getMonthlySpent(
  transactions: FinanceTransaction[],
  monthKey: string,
): number {
  return transactions
    .filter((tx) => isSameMonth(parseTransactionDate(tx.occurredAt), monthKey))
    .reduce((sum, tx) => sum + tx.amount, 0);
}

export function getCategoryBreakdown(
  categories: FinanceCategory[],
  transactions: FinanceTransaction[],
  monthKey: string,
): CategorySpend[] {
  const totals = new Map<string, number>();

  for (const tx of transactions) {
    if (!isSameMonth(parseTransactionDate(tx.occurredAt), monthKey)) {
      continue;
    }
    totals.set(tx.categorySlug, (totals.get(tx.categorySlug) ?? 0) + tx.amount);
  }

  return categories
    .map((cat) => ({
      slug: cat.slug,
      label: cat.label,
      color: cat.color,
      value: totals.get(cat.slug) ?? 0,
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);
}

export function getMonthSeries(
  transactions: FinanceTransaction[],
  months = 6,
  referenceDate = new Date(),
): MonthPoint[] {
  const points: MonthPoint[] = [];

  for (let i = months - 1; i >= 0; i -= 1) {
    const date = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
    const monthKey = getMonthKey(date);
    const amount = getMonthlySpent(transactions, monthKey);
    points.push({
      monthKey,
      month: date.toLocaleString("en-US", { month: "short" }),
      amount,
    });
  }

  return points;
}

export function getWeeklySeries(
  transactions: FinanceTransaction[],
  referenceDate = new Date(),
): DayPoint[] {
  const current = new Date(referenceDate);
  const day = current.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const points: DayPoint[] = [];
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  for (let i = 0; i < 7; i += 1) {
    const start = new Date(monday);
    start.setDate(monday.getDate() + i);

    const end = new Date(start);
    end.setDate(start.getDate() + 1);

    const amount = transactions
      .filter((tx) => {
        const txDate = parseTransactionDate(tx.occurredAt);
        return txDate >= start && txDate < end;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);

    points.push({ day: labels[i], amount });
  }

  return points;
}

export function getTransactionsByDate(
  transactions: FinanceTransaction[],
): Array<{ date: string; items: FinanceTransaction[] }> {
  const groups = new Map<string, FinanceTransaction[]>();

  const sorted = [...transactions].sort(
    (a, b) => parseTransactionDate(b.occurredAt).getTime() - parseTransactionDate(a.occurredAt).getTime(),
  );

  for (const tx of sorted) {
    const txDate = parseTransactionDate(tx.occurredAt);
    const key = [
      txDate.getFullYear(),
      String(txDate.getMonth() + 1).padStart(2, "0"),
      String(txDate.getDate()).padStart(2, "0"),
    ].join("-");
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)?.push(tx);
  }

  return Array.from(groups.entries()).map(([key, items]) => {
    const [year, month, day] = key.split("-").map(Number);
    const date = new Date(year, (month ?? 1) - 1, day ?? 1);
    const label = formatDateGroupLabel(date);
    return { date: label, items };
  });
}

export function formatDateGroupLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (target.getTime() === today.getTime()) {
    return `Today, ${target.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  }

  if (target.getTime() === yesterday.getTime()) {
    return `Yesterday, ${target.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  }

  return target.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTimeLabel(occurredAt: string): string {
  return parseTransactionDate(occurredAt).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}
