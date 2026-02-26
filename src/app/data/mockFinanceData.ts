import type { FinanceSnapshot } from "../domain/finance";
import { getMonthKey } from "../domain/finance";

const now = new Date();

function atOffset(hoursAgo: number): string {
  return new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString();
}

export const mockFinanceSnapshot: FinanceSnapshot = {
  categories: [
    { slug: "food", label: "Food & Drink", color: "#F4618A", icon: "utensils" },
    { slug: "shopping", label: "Shopping", color: "#CEF62E", icon: "shopping-bag" },
    { slug: "transport", label: "Transport", color: "#61A4F4", icon: "car" },
    { slug: "bills", label: "Bills", color: "#F4C761", icon: "zap" },
    { slug: "housing", label: "Housing", color: "#30E48D", icon: "home" },
    { slug: "entertainment", label: "Entertainment", color: "#C77DFF", icon: "gamepad" },
    { slug: "health", label: "Health", color: "#FF6B6B", icon: "heart" },
    { slug: "education", label: "Education", color: "#4ECDC4", icon: "graduation-cap" },
    { slug: "travel", label: "Travel", color: "#FFB86C", icon: "plane" },
  ],
  monthlyBudget: {
    monthKey: getMonthKey(now),
    amount: 3500,
  },
  transactions: [
    { id: "1", merchant: "Whole Foods Market", categorySlug: "food", amount: 67.43, tags: ["Groceries", "Weekly"], note: null, occurredAt: atOffset(5) },
    { id: "2", merchant: "Shell Gas Station", categorySlug: "transport", amount: 45.0, tags: ["Gas", "Commute"], note: null, occurredAt: atOffset(8) },
    { id: "3", merchant: "Netflix", categorySlug: "entertainment", amount: 15.99, tags: ["Subscription", "Monthly"], note: null, occurredAt: atOffset(24) },
    { id: "4", merchant: "Chipotle", categorySlug: "food", amount: 14.85, tags: ["Lunch", "Dining Out"], note: null, occurredAt: atOffset(26) },
    { id: "5", merchant: "Electric Company", categorySlug: "bills", amount: 128.5, tags: ["Utilities", "Monthly"], note: null, occurredAt: atOffset(48) },
    { id: "6", merchant: "Target", categorySlug: "shopping", amount: 89.23, tags: ["Household", "Essentials"], note: null, occurredAt: atOffset(51) },
    { id: "7", merchant: "Rent Payment", categorySlug: "housing", amount: 1850, tags: ["Rent", "Monthly"], note: null, occurredAt: atOffset(96) },
    { id: "8", merchant: "Coursera", categorySlug: "education", amount: 39, tags: ["Course", "Learning"], note: null, occurredAt: atOffset(98) },
    { id: "9", merchant: "Starbucks", categorySlug: "food", amount: 6.75, tags: ["Coffee", "Daily"], note: null, occurredAt: atOffset(72) },
    { id: "10", merchant: "Amazon", categorySlug: "shopping", amount: 34.99, tags: ["Online", "Electronics"], note: null, occurredAt: atOffset(74) },
  ],
};
