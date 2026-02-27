import { isAiEnabled } from "../config/featureFlags";

export interface AnalyzeExpenseResponse {
  merchant: string;
  amount: number;
  categorySlug: string;
  confidence: number;
  reason: string;
}

export async function analyzeExpenseText(input: {
  text: string;
  categories: Array<{ slug: string; label: string }>;
}): Promise<{ ok: true; data: AnalyzeExpenseResponse } | { ok: false; error: string }> {
  if (!isAiEnabled) {
    return { ok: false, error: "AI is disabled by configuration" };
  }

  try {
    const response = await fetch("/api/ai/analyze", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });

    const payload = (await response.json()) as Partial<AnalyzeExpenseResponse> & { error?: string };
    if (!response.ok) {
      return { ok: false, error: payload.error ?? "AI analyze request failed" };
    }

    if (
      typeof payload.merchant !== "string" ||
      typeof payload.amount !== "number" ||
      typeof payload.categorySlug !== "string"
    ) {
      return { ok: false, error: "AI response missing required fields" };
    }

    return {
      ok: true,
      data: {
        merchant: payload.merchant,
        amount: payload.amount,
        categorySlug: payload.categorySlug,
        confidence: typeof payload.confidence === "number" ? payload.confidence : 0,
        reason: typeof payload.reason === "string" ? payload.reason : "",
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI analyze request failed";
    return { ok: false, error: message };
  }
}
