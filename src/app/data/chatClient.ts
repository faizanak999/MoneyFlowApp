import { isAiEnabled } from "../config/featureFlags";

export async function askFinanceAssistant(input: {
  question: string;
  context: {
    monthBudget: number;
    monthSpent: number;
    categories: Array<{ slug: string; label: string; total: number }>;
    recentTransactions: Array<{
      merchant: string;
      amount: number;
      category: string;
      occurredAt: string;
      tags: string[];
    }>;
  };
}): Promise<{ ok: true; answer: string } | { ok: false; error: string }> {
  if (!isAiEnabled) {
    return { ok: false, error: "AI is disabled by configuration" };
  }

  try {
    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });

    const payload = (await response.json()) as { answer?: string; error?: string };
    if (!response.ok) {
      return { ok: false, error: payload.error ?? "AI chat request failed" };
    }

    if (!payload.answer) {
      return { ok: false, error: "AI response is empty" };
    }

    return { ok: true, answer: payload.answer };
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI chat request failed";
    return { ok: false, error: message };
  }
}
