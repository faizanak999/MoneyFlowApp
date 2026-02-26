import { useCallback, useEffect, useState } from "react";
import {
  createTransaction,
  getFinanceSnapshot,
  type CreateTransactionInput,
  upsertMonthlyBudget,
} from "../data/financeRepository";
import { mockFinanceSnapshot } from "../data/mockFinanceData";
import type { FinanceSnapshot } from "../domain/finance";

export function useFinanceData() {
  const [snapshot, setSnapshot] = useState<FinanceSnapshot>(mockFinanceSnapshot);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await getFinanceSnapshot();
    setSnapshot(data);
    setLoading(false);
  }, []);

  const saveBudget = useCallback(async (amount: number) => {
    setSnapshot((prev) => ({
      ...prev,
      monthlyBudget: {
        ...prev.monthlyBudget,
        amount,
      },
    }));

    await upsertMonthlyBudget(amount);
  }, []);

  const addTransaction = useCallback(async (input: CreateTransactionInput) => {
    const provisionalId = `tmp-${Date.now()}`;
    const provisionalOccurredAt = new Date().toISOString();

    setSnapshot((prev) => ({
      ...prev,
      transactions: [
        {
          id: provisionalId,
          merchant: input.merchant,
          categorySlug: input.categorySlug,
          amount: input.amount,
          tags: input.tags,
          note: input.note ?? null,
          occurredAt: provisionalOccurredAt,
        },
        ...prev.transactions,
      ],
    }));

    const created = await createTransaction(input);
    if (!created.ok || !created.id || !created.occurredAt) {
      setSnapshot((prev) => ({
        ...prev,
        transactions: prev.transactions.filter((tx) => tx.id !== provisionalId),
      }));
      return {
        ok: false,
        error: created.error ?? "Could not save transaction",
      };
    }

    setSnapshot((prev) => ({
      ...prev,
      transactions: prev.transactions.map((tx) =>
        tx.id === provisionalId
          ? { ...tx, id: created.id, occurredAt: created.occurredAt }
          : tx,
      ),
    }));

    return {
      ok: true,
    };
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    snapshot,
    loading,
    refresh,
    saveBudget,
    addTransaction,
  };
}
