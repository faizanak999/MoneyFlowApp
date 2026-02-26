import { useMemo, useState } from "react";
import {
  Filter,
  Search,
  ChevronDown,
} from "lucide-react";
import { motion } from "motion/react";
import { useFinanceData } from "../hooks/useFinanceData";
import { formatTimeLabel, getTransactionsByDate } from "../domain/finance";
import { getCategoryIcon } from "../domain/categoryIcons";

export function LedgerScreen() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { snapshot } = useFinanceData();

  const categories = useMemo(
    () => [{ slug: "all", label: "All", color: "#FFFFFF", icon: "all" }, ...snapshot.categories],
    [snapshot.categories],
  );

  const filteredData = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const filteredTx = snapshot.transactions.filter((item) => {
      const matchesCategory = activeCategory === "all" || item.categorySlug === activeCategory;
      const matchesSearch =
        normalizedQuery.length === 0 ||
        item.merchant.toLowerCase().includes(normalizedQuery) ||
        item.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

      return matchesCategory && matchesSearch;
    });

    return getTransactionsByDate(filteredTx);
  }, [snapshot.transactions, activeCategory, searchQuery]);

  return (
    <div className="flex flex-col pb-28 pt-6">
      <div className="px-4 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-white text-[22px] tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Ledger
          </h1>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-white/5 text-[#8A8494] text-[13px]">
              <Filter size={14} />
              Filter
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-white/5 text-[#8A8494] text-[13px]">
              {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              <ChevronDown size={14} />
            </button>
          </div>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8494]" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2.5 rounded-[14px] bg-[#1A1620] text-white placeholder:text-[#3D3849] focus:outline-none text-[14px]"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full whitespace-nowrap shrink-0 transition-all text-[13px]"
                style={{
                  background: isActive ? cat.color : "rgba(255,255,255,0.04)",
                  color: isActive ? "#0D0A0F" : "#8A8494",
                  border: `1px solid ${isActive ? cat.color : "rgba(255,255,255,0.06)"}`,
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {cat.slug !== "all" && (() => {
                  const Icon = getCategoryIcon(cat.slug);
                  return <Icon size={13} />;
                })()}
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 flex flex-col gap-5">
        {filteredData.map((group) => (
          <div key={group.date}>
            <p className="text-[#8A8494] text-[12px] tracking-wide uppercase mb-2 px-1">{group.date}</p>
            <div className="flex flex-col gap-1.5">
              {group.items.map((item, idx) => {
                const category = snapshot.categories.find((cat) => cat.slug === item.categorySlug);
                const Icon = getCategoryIcon(item.categorySlug);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-[16px] hover:bg-white/[0.02] transition-colors"
                    style={{ background: "#1A1620", border: "1px solid rgba(255,255,255,0.03)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0"
                      style={{ background: `${category?.color ?? "#8A8494"}15` }}
                    >
                      <Icon size={18} style={{ color: category?.color ?? "#8A8494" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-[14px] truncate">{item.merchant}</p>
                      <div className="flex items-center gap-1.5 mt-1 overflow-x-auto">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap"
                            style={{
                              background: `${category?.color ?? "#8A8494"}12`,
                              color: category?.color ?? "#8A8494",
                              border: `1px solid ${category?.color ?? "#8A8494"}20`,
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-white text-[14px]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}>
                        -Rs. {item.amount.toFixed(2)}
                      </p>
                      <p className="text-[#8A8494] text-[11px]">{formatTimeLabel(item.occurredAt)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
