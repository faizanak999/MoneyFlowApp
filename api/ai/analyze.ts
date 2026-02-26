type AnalyzePayload = {
  text?: string;
  categories?: Array<{ slug: string; label: string }>;
};

type AnalyzeResult = {
  merchant: string;
  amount: number;
  categorySlug: string;
  confidence: number;
  reason: string;
};

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

function json(res: any, status: number, body: unknown): void {
  res.status(status).setHeader("content-type", "application/json").send(JSON.stringify(body));
}

function parseJsonText(text: string): AnalyzeResult | null {
  try {
    const parsed = JSON.parse(text) as Partial<AnalyzeResult>;
    if (
      typeof parsed.merchant === "string" &&
      typeof parsed.amount === "number" &&
      typeof parsed.categorySlug === "string"
    ) {
      return {
        merchant: parsed.merchant.trim() || "Expense",
        amount: Number(parsed.amount.toFixed(2)),
        categorySlug: parsed.categorySlug,
        confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.6,
        reason: typeof parsed.reason === "string" ? parsed.reason : "AI parse",
      };
    }
  } catch {
    return null;
  }

  return null;
}

function extractTextResponse(data: any): string {
  const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return typeof candidate === "string" ? candidate : "";
}

export default async function handler(req: any, res: any): Promise<void> {
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    json(res, 500, { error: "GEMINI_API_KEY is not set" });
    return;
  }

  const body = (req.body || {}) as AnalyzePayload;
  const text = (body.text || "").trim();
  if (!text) {
    json(res, 400, { error: "text is required" });
    return;
  }

  const categories = Array.isArray(body.categories) ? body.categories : [];
  const allowedCategorySlugs = categories.map((cat) => cat.slug).filter(Boolean);
  const categoryGuide = categories.map((cat) => `${cat.slug}: ${cat.label}`).join(", ");

  const prompt = [
    "Extract a finance transaction from this user text.",
    "Return JSON only with keys:",
    "merchant (string), amount (number), categorySlug (string), confidence (number 0..1), reason (string).",
    `Allowed categorySlug values: ${allowedCategorySlugs.join(", ") || "shopping"}.`,
    `Category map: ${categoryGuide || "shopping: Shopping"}.`,
    `User text: ${text}`,
  ].join("\n");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(DEFAULT_MODEL)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      json(res, 502, { error: `Gemini API error: ${response.status} ${errorText}` });
      return;
    }

    const data = await response.json();
    const raw = extractTextResponse(data);
    const parsed = parseJsonText(raw);

    if (!parsed) {
      json(res, 502, { error: "Invalid AI response format" });
      return;
    }

    if (allowedCategorySlugs.length > 0 && !allowedCategorySlugs.includes(parsed.categorySlug)) {
      parsed.categorySlug = allowedCategorySlugs[0];
    }

    json(res, 200, parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected AI server error";
    json(res, 500, { error: message });
  }
}
