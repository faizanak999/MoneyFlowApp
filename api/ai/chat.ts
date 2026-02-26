type ChatPayload = {
  question?: string;
  context?: {
    monthBudget?: number;
    monthSpent?: number;
    categories?: Array<{ slug: string; label: string; total: number }>;
    recentTransactions?: Array<{
      merchant: string;
      amount: number;
      category: string;
      occurredAt: string;
      tags?: string[];
    }>;
  };
};

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

function json(res: any, status: number, body: unknown): void {
  res.status(status).setHeader("content-type", "application/json").send(JSON.stringify(body));
}

function getAssistantPrompt(payload: ChatPayload): string {
  const question = (payload.question || "").trim();
  const context = payload.context || {};

  return [
    "You are FinFlow AI, a concise personal finance assistant.",
    "Always answer in plain text and be practical.",
    "Currency is Rs. Use amounts from provided context only.",
    "If context is insufficient, say what is missing and suggest one follow-up question.",
    "Keep response under 140 words.",
    "",
    `User question: ${question}`,
    "",
    "Finance context JSON:",
    JSON.stringify(context),
  ].join("\n");
}

function extractTextResponse(data: any): string {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    return "";
  }

  const text = parts
    .map((part: any) => (typeof part?.text === "string" ? part.text : ""))
    .join("\n")
    .trim();

  return text;
}

function parseBody(rawBody: unknown): ChatPayload {
  if (rawBody && typeof rawBody === "object") {
    return rawBody as ChatPayload;
  }

  if (typeof rawBody === "string") {
    try {
      const parsed = JSON.parse(rawBody) as ChatPayload;
      if (parsed && typeof parsed === "object") {
        return parsed;
      }
    } catch {
      return {};
    }
  }

  return {};
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

  const body = parseBody(req.body);
  const question = (body.question || "").trim();
  if (!question) {
    json(res, 400, { error: "question is required" });
    return;
  }

  const prompt = getAssistantPrompt(body);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(DEFAULT_MODEL)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
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
    const answer = extractTextResponse(data);

    if (!answer) {
      json(res, 502, { error: "Empty AI response" });
      return;
    }

    json(res, 200, { answer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected AI server error";
    json(res, 500, { error: message });
  }
}
