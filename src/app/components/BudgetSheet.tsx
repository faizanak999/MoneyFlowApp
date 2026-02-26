import { useState, useEffect, useRef } from "react";
import { Drawer } from "vaul";
import { Check } from "lucide-react";
import { motion } from "motion/react";

interface BudgetSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  budget: number;
  spent: number;
  onSave: (budget: number) => void;
}

const PRESET_AMOUNTS = [2000, 3000, 5000, 7500, 10000, 15000];

export function BudgetSheet({ open, onOpenChange, budget, spent, onSave }: BudgetSheetProps) {
  const [inputValue, setInputValue] = useState(budget.toString());
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(budget.toString());
    setSaved(false);
  }, [budget, open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  const currentBudget = parseInt(inputValue) || 0;
  const remaining = currentBudget - spent;
  const usedPercent = currentBudget > 0 ? Math.min((spent / currentBudget) * 100, 100) : 0;

  const handleSave = () => {
    onSave(currentBudget);
    setSaved(true);
    setTimeout(() => {
      onOpenChange(false);
    }, 600);
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50" />
        <Drawer.Content
          className="fixed bottom-0 left-0 right-0 z-50 flex flex-col outline-none"
        >
          <div
            className="mx-auto w-full max-w-[430px] flex flex-col rounded-t-[24px] overflow-hidden"
            style={{ background: "#13101A" }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-white/15" />
            </div>

            <div className="px-5 pb-8 flex flex-col gap-6">
              {/* Header */}
              <div>
                <Drawer.Title
                  className="text-white text-[20px] tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Set Monthly Budget
                </Drawer.Title>
                <Drawer.Description className="text-[#8A8494] text-[13px] mt-0.5">
                  How much do you want to spend this month?
                </Drawer.Description>
              </div>

              {/* Budget Input */}
              <div
                className="rounded-[20px] p-6 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(206, 246, 46, 0.08), rgba(48, 228, 141, 0.04))",
                  border: "1px solid rgba(206, 246, 46, 0.12)",
                }}
              >
                <p className="text-[#8A8494] text-[11px] tracking-widest uppercase mb-4">
                  Total Budget
                </p>
                <div className="flex items-baseline gap-1">
                  <span
                    className="text-[#8A8494] text-[24px]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
                  >
                    Rs.
                  </span>
                  <input
                    ref={inputRef}
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    className="bg-transparent text-[#CEF62E] text-[42px] w-full focus:outline-none"
                    style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}
                    placeholder="0"
                  />
                </div>

                {/* Spent vs Remaining summary */}
                <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/5">
                  <div className="flex-1">
                    <p className="text-[#8A8494] text-[11px] mb-1">Spent so far</p>
                    <p
                      className="text-white text-[16px]"
                      style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}
                    >
                      Rs. {spent.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex-1">
                    <p className="text-[#8A8494] text-[11px] mb-1">Will remain</p>
                    <p
                      className="text-[16px]"
                      style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        color: remaining >= 0 ? "#30E48D" : "#F4618A",
                      }}
                    >
                      {remaining >= 0
                        ? `Rs. ${remaining.toLocaleString()}`
                        : `- Rs. ${Math.abs(remaining).toLocaleString()}`}
                    </p>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-4 h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: usedPercent > 90 ? "#F4618A" : "#CEF62E" }}
                    initial={{ width: 0 }}
                    animate={{ width: `${usedPercent}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <p className="text-[#8A8494] text-[11px] mt-1.5 text-right">
                  {usedPercent.toFixed(0)}% used
                </p>
              </div>

              {/* Quick Presets */}
              <div>
                <p className="text-[#8A8494] text-[11px] tracking-widest uppercase mb-3">
                  Quick Set
                </p>
                <div className="flex flex-wrap gap-2">
                  {PRESET_AMOUNTS.map((amount) => {
                    const isSelected = currentBudget === amount;
                    return (
                      <button
                        key={amount}
                        onClick={() => setInputValue(amount.toString())}
                        className="px-4 py-2 rounded-[12px] text-[13px] transition-all active:scale-95"
                        style={{
                          background: isSelected ? "rgba(206, 246, 46, 0.15)" : "rgba(255,255,255,0.04)",
                          border: isSelected ? "1px solid rgba(206, 246, 46, 0.3)" : "1px solid rgba(255,255,255,0.06)",
                          color: isSelected ? "#CEF62E" : "#8A8494",
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontWeight: 500,
                        }}
                      >
                        Rs. {amount.toLocaleString()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                disabled={currentBudget <= 0}
                className="w-full py-3.5 rounded-[16px] text-[15px] transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-40"
                style={{
                  background: saved ? "#30E48D" : "#CEF62E",
                  color: "#0D0A0F",
                  fontWeight: 600,
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                {saved ? (
                  <>
                    <Check size={18} />
                    Saved!
                  </>
                ) : (
                  "Save Budget"
                )}
              </button>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
