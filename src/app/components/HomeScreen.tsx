import { type ChangeEvent, useMemo, useRef, useState } from "react";
import {
  Camera,
  Image as ImageIcon,
  Send,
  TrendingDown,
  ArrowUpRight,
  X,
  Pencil,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BudgetSheet } from "./BudgetSheet";
import AppIcon from "../../imports/Group";
import { useFinanceData } from "../hooks/useFinanceData";
import {
  getCategoryBreakdown,
  getMonthKey,
  getMonthlySpent,
  parseTransactionDate,
} from "../domain/finance";
import { getCategoryIcon } from "../domain/categoryIcons";
import { parseQuickAddExpense } from "../domain/quickAdd";
import { analyzeExpenseText } from "../data/aiClient";

export function HomeScreen() {
  const [expenseText, setExpenseText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [receiptThumbnails, setReceiptThumbnails] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [budgetSheetOpen, setBudgetSheetOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { snapshot, saveBudget, addTransaction } = useFinanceData();

  const monthKey = getMonthKey();
  const prevMonthKey = getMonthKey(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1));

  const totalSpent = useMemo(
    () => getMonthlySpent(snapshot.transactions, monthKey),
    [snapshot.transactions, monthKey],
  );

  const prevMonthSpent = useMemo(
    () => getMonthlySpent(snapshot.transactions, prevMonthKey),
    [snapshot.transactions, prevMonthKey],
  );

  const budget = snapshot.monthlyBudget.amount;
  const remaining = budget - totalSpent;
  const usedPercent = budget > 0 ? Math.min((totalSpent / budget) * 100, 100) : 0;
  const trendPercent = prevMonthSpent > 0 ? Math.round(((prevMonthSpent - totalSpent) / prevMonthSpent) * 100) : 0;

  const miniCards = useMemo(() => {
    const monthlyBreakdown = getCategoryBreakdown(snapshot.categories, snapshot.transactions, monthKey);
    const bySlug = new Map(monthlyBreakdown.map((item) => [item.slug, item]));
    const preferred = ["food", "transport", "shopping", "bills"];

    return preferred
      .map((slug) => {
        const category = snapshot.categories.find((cat) => cat.slug === slug);
        const spend = bySlug.get(slug);
        if (!category) {
          return null;
        }

        return {
          id: category.slug,
          label: category.label,
          icon: category.icon,
          color: category.color,
          spent: spend?.value ?? 0,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
  }, [snapshot.categories, snapshot.transactions, monthKey]);

  const recentTransactions = useMemo(
    () => [...snapshot.transactions]
      .sort((a, b) => parseTransactionDate(b.occurredAt).getTime() - parseTransactionDate(a.occurredAt).getTime())
      .slice(0, 4),
    [snapshot.transactions],
  );

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) {
      return;
    }

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setReceiptThumbnails((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeReceipt = (index: number) => {
    setReceiptThumbnails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddExpense = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    const fallbackParsed = parseQuickAddExpense(expenseText, snapshot.categories);
    const aiResult = await analyzeExpenseText({
      text: expenseText.trim(),
      categories: snapshot.categories.map((category) => ({
        slug: category.slug,
        label: category.label,
      })),
    });

    const useAiResult =
      aiResult.ok &&
      aiResult.data.confidence >= 0.6 &&
      snapshot.categories.some((category) => category.slug === aiResult.data.categorySlug) &&
      aiResult.data.amount > 0;

    const parsed = useAiResult
      ? {
          merchant: aiResult.data.merchant,
          amount: Number(aiResult.data.amount.toFixed(2)),
          categorySlug: aiResult.data.categorySlug,
          tags: [],
        }
      : fallbackParsed;

    if (!parsed) {
      setIsSubmitting(false);
      setSubmitError("Add a valid amount, for example: Spent Rs. 250 at Grocery Store");
      return;
    }

    const result = await addTransaction({
      merchant: parsed.merchant,
      categorySlug: parsed.categorySlug,
      amount: parsed.amount,
      tags: parsed.tags,
      note: expenseText.trim(),
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error ?? "Could not save this expense. Please try again.");
      return;
    }

    setExpenseText("");
    setReceiptThumbnails([]);
  };

  return (
    <div className="flex flex-col gap-6 pb-28 px-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#8A8494] text-[13px] tracking-wide">Good evening</p>
          <h1 className="text-white text-[22px] tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            My Finances
          </h1>
        </div>
        <div className="w-10 h-10 rounded-[10px] overflow-hidden">
          <AppIcon />
        </div>
      </div>

      <button
        onClick={() => setBudgetSheetOpen(true)}
        className="w-full text-left rounded-[20px] p-5 relative overflow-hidden group cursor-pointer transition-transform active:scale-[0.98]"
        style={{
          background: "linear-gradient(135deg, #CEF62E, #a8d926)",
          boxShadow: "0 8px 32px rgba(206, 246, 46, 0.2)",
        }}
      >
        <div
          className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <p className="text-[#0D0A0F] text-[12px] tracking-widest uppercase opacity-70">This Month</p>
            <div className="w-5 h-5 rounded-[5px] bg-[#0D0A0F]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Pencil size={10} className="text-[#0D0A0F]" />
            </div>
          </div>
          <span className="flex items-center gap-1 text-[12px] px-2 py-0.5 rounded-full" style={{ background: "rgba(13, 10, 15, 0.1)", color: "#0D0A0F" }}>
            <TrendingDown size={12} />
            {Math.abs(trendPercent)}% {trendPercent >= 0 ? "less" : "more"}
          </span>
        </div>
        <h2 className="text-[#0D0A0F] text-[36px] tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>
          Rs. {Math.floor(totalSpent).toLocaleString()}
          <span className="text-[16px] opacity-50">.{(totalSpent % 1).toFixed(2).split(".")[1]}</span>
        </h2>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#0D0A0F] opacity-60" />
            <span className="text-[12px] text-[#0D0A0F] opacity-60">Budget: Rs. {budget.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: remaining >= 0 ? "#30E48D" : "#F4618A" }} />
            <span className="text-[12px] text-[#0D0A0F] opacity-60">
              {remaining >= 0
                ? `Remaining: Rs. ${Math.floor(remaining).toLocaleString()}`
                : `Over by: Rs. ${Math.abs(Math.floor(remaining)).toLocaleString()}`}
            </span>
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-[#0D0A0F]/10 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[#0D0A0F]"
            initial={{ width: 0 }}
            animate={{ width: `${usedPercent}%` }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
        </div>
      </button>

      <BudgetSheet
        open={budgetSheetOpen}
        onOpenChange={setBudgetSheetOpen}
        budget={budget}
        spent={totalSpent}
        onSave={(nextBudget) => {
          void saveBudget(nextBudget);
        }}
      />

      <motion.div
        layout
        className="relative rounded-[24px] overflow-hidden"
        style={{
          background: isFocused
            ? "linear-gradient(135deg, rgba(206, 246, 46, 0.08), rgba(48, 228, 141, 0.05))"
            : "#1A1620",
          border: isFocused ? "1.5px solid rgba(206, 246, 46, 0.3)" : "1.5px solid rgba(255, 255, 255, 0.06)",
          boxShadow: isFocused
            ? "0 0 40px rgba(206, 246, 46, 0.08), 0 8px 32px rgba(0,0,0,0.3)"
            : "0 4px 24px rgba(0,0,0,0.2)",
          transition: "all 0.3s ease",
        }}
      >
        <div className="p-5 pb-3">
          <p className="text-[#8A8494] text-[12px] tracking-widest uppercase mb-3">Quick Add Expense</p>
          <textarea
            value={expenseText}
            onChange={(e) => setExpenseText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Spent Rs. 50 on dinner at..."
            rows={3}
            className="w-full bg-transparent text-white text-[20px] placeholder:text-[#3D3849] resize-none focus:outline-none"
            style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 400, lineHeight: 1.4 }}
          />
          {submitError ? <p className="text-[#F4618A] text-[12px] mt-2">{submitError}</p> : null}
        </div>

        <AnimatePresence>
          {receiptThumbnails.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-5 pb-2"
            >
              <div className="flex gap-2 overflow-x-auto py-1">
                {receiptThumbnails.map((thumb, index) => (
                  <div key={index} className="relative shrink-0 w-16 h-16 rounded-[12px] overflow-hidden border border-white/10">
                    <img src={thumb} alt="Receipt" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeReceipt(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-[#0D0A0F] border border-white/20 rounded-full flex items-center justify-center"
                    >
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[12px] bg-white/5 hover:bg-white/10 transition-all text-[#8A8494] hover:text-white"
            >
              <Camera size={16} />
              <span className="text-[12px]">Receipt</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[12px] bg-white/5 hover:bg-white/10 transition-all text-[#8A8494] hover:text-white"
            >
              <ImageIcon size={16} />
              <span className="text-[12px]">Gallery</span>
            </button>
          </div>
          <button
            onClick={() => {
              void handleAddExpense();
            }}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2 rounded-[14px] text-[13px] transition-all hover:scale-105 active:scale-95"
            style={{
              background: expenseText ? "#CEF62E" : "rgba(206, 246, 46, 0.15)",
              color: expenseText ? "#0D0A0F" : "#CEF62E",
              fontWeight: 600,
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            <Send size={14} />
            {isSubmitting ? "Saving..." : "Add"}
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {miniCards.map((cat) => {
          const pct = budget > 0 ? Math.round((cat.spent / budget) * 100) : 0;
          return (
            <div
              key={cat.id}
              className="rounded-[16px] p-4 hover:scale-[1.02] transition-transform cursor-pointer"
              style={{ background: "#1A1620", border: "1px solid rgba(255,255,255,0.04)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[20px]">{cat.icon === "utensils" ? "🍔" : cat.icon === "car" ? "🚗" : cat.icon === "shopping-bag" ? "🛍️" : "⚡"}</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: `${cat.color}15`, color: cat.color }}>
                  {pct}%
                </span>
              </div>
              <p className="text-[#8A8494] text-[12px]">{cat.label}</p>
              <p className="text-white text-[18px]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
                Rs. {cat.spent.toLocaleString()}
              </p>
              <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: cat.color }} />
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-[16px]" style={{ fontWeight: 600 }}>Recent Activity</h3>
          <button className="text-[#CEF62E] text-[13px] flex items-center gap-1">
            See all <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {recentTransactions.map((tx) => {
            const category = snapshot.categories.find((item) => item.slug === tx.categorySlug);
            const Icon = getCategoryIcon(tx.categorySlug);
            return (
              <div key={tx.id} className="flex items-center gap-3 p-3 rounded-[16px] hover:bg-white/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0" style={{ background: `${category?.color ?? "#8A8494"}15` }}>
                  <Icon size={18} style={{ color: category?.color ?? "#8A8494" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[14px] truncate">{tx.merchant}</p>
                  <p className="text-[#8A8494] text-[12px]">{new Date(tx.occurredAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-[14px]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}>
                    Rs. {tx.amount.toFixed(2)}
                  </p>
                  <p className="text-[#8A8494] text-[11px]">{category?.label ?? "Other"}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
