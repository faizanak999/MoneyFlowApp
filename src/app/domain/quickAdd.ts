import type { FinanceCategory } from "./finance";

export interface ParsedExpenseInput {
  amount: number;
  merchant: string;
  categorySlug: string;
  tags: string[];
}

const categoryKeywords: Record<string, string[]> = {
  food: [
    "food",
    "dinner",
    "lunch",
    "breakfast",
    "restaurant",
    "cafe",
    "coffee",
    "kfc",
    "mcdonald",
    "burger king",
    "pizza",
    "chipotle",
    "starbucks",
    "zomato",
    "swiggy",
  ],
  transport: ["uber", "taxi", "fuel", "gas", "petrol", "bus", "train", "transport"],
  shopping: ["amazon", "shopping", "store", "mall", "target"],
  bills: ["bill", "utility", "electric", "water", "internet", "phone"],
  housing: ["rent", "housing", "apartment", "mortgage"],
  entertainment: ["movie", "netflix", "spotify", "game", "entertainment"],
  health: ["doctor", "hospital", "medicine", "health", "gym"],
  education: ["course", "education", "class", "tuition", "book"],
  travel: ["flight", "hotel", "trip", "travel"],
};

function inferCategorySlug(text: string, categories: FinanceCategory[]): string {
  const lower = text.toLowerCase();
  const available = new Set(categories.map((cat) => cat.slug));

  for (const [slug, keywords] of Object.entries(categoryKeywords)) {
    if (!available.has(slug)) {
      continue;
    }

    if (keywords.some((keyword) => lower.includes(keyword))) {
      return slug;
    }
  }

  if (available.has("shopping")) {
    return "shopping";
  }

  return categories[0]?.slug ?? "shopping";
}

function extractAmount(text: string): number | null {
  const explicitRsMatch = text.match(/rs\.?\s*(\d+(?:\.\d{1,2})?)/i);
  if (explicitRsMatch?.[1]) {
    return Number.parseFloat(explicitRsMatch[1]);
  }

  const genericMatch = text.match(/(\d+(?:\.\d{1,2})?)/);
  if (genericMatch?.[1]) {
    return Number.parseFloat(genericMatch[1]);
  }

  return null;
}

function extractMerchant(text: string): string {
  const atMatch = text.match(/\bat\s+([a-z0-9 '&.-]+)/i);
  if (atMatch?.[1]) {
    return atMatch[1].trim();
  }

  const onMatch = text.match(/\bon\s+[a-z0-9.'-]+\s+at\s+([a-z0-9 '&.-]+)/i);
  if (onMatch?.[1]) {
    return onMatch[1].trim();
  }

  const forMatch = text.match(/\bfor\s+([a-z0-9 '&.-]+)/i);
  if (forMatch?.[1]) {
    return normalizeLabel(forMatch[1]);
  }

  const onCategoryMatch = text.match(/\bon\s+([a-z0-9 '&.-]+)/i);
  if (onCategoryMatch?.[1]) {
    return normalizeLabel(onCategoryMatch[1]);
  }

  const cleaned = text
    .replace(/rs\.?\s*\d+(?:\.\d{1,2})?/gi, "")
    .replace(/\bspent\b/gi, "")
    .replace(/[^\w\s&.-]/g, " ")
    .trim();

  if (cleaned.length > 0) {
    const merchantWords = cleaned
      .split(/\s+/)
      .filter((word) => !/^\d+(?:\.\d+)?$/.test(word))
      .slice(0, 3)
      .join(" ");
    if (merchantWords) {
      return normalizeLabel(merchantWords);
    }
  }

  return "Expense";
}

function normalizeLabel(value: string): string {
  const words = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3);

  if (words.length === 0) {
    return "Expense";
  }

  return words
    .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function parseQuickAddExpense(
  text: string,
  categories: FinanceCategory[],
): ParsedExpenseInput | null {
  const amount = extractAmount(text);
  if (!amount || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  const merchant = extractMerchant(text);
  const categorySlug = inferCategorySlug(text, categories);

  return {
    amount: Number(amount.toFixed(2)),
    merchant,
    categorySlug,
    tags: [],
  };
}
