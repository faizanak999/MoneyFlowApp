import { useState, useRef, useEffect, useMemo } from "react";
import { Sparkles, ArrowUp } from "lucide-react";
import { motion } from "motion/react";
import { askFinanceAssistant } from "../data/chatClient";
import { useFinanceData } from "../hooks/useFinanceData";
import { getCategoryBreakdown, getMonthKey, getMonthlySpent } from "../domain/finance";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const suggestedPrompts = [
  "How much did I spend on food last week?",
  "What's my biggest expense this month?",
  "Compare my spending to last month",
  "Show my subscription costs",
  "Am I on track with my budget?",
  "Where can I cut costs?",
];

function fallbackAssistantAnswer(question: string): string {
  return `I could not reach the AI service right now. Please try again in a moment. Your question was: "${question}".`;
}

export function AIAssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content: "Hi! I'm your AI finance assistant. Ask me anything about your spending, budgets, or financial goals.",
      timestamp: "Now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { snapshot } = useFinanceData();

  const monthKey = getMonthKey();
  const monthSpent = useMemo(
    () => getMonthlySpent(snapshot.transactions, monthKey),
    [snapshot.transactions, monthKey],
  );

  const categoryTotals = useMemo(
    () => getCategoryBreakdown(snapshot.categories, snapshot.transactions, monthKey),
    [snapshot.categories, snapshot.transactions, monthKey],
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const aiResult = await askFinanceAssistant({
      question: trimmed,
      context: {
        monthBudget: snapshot.monthlyBudget.amount,
        monthSpent,
        categories: categoryTotals.map((item) => ({
          slug: item.slug,
          label: item.label,
          total: Number(item.value.toFixed(2)),
        })),
        recentTransactions: snapshot.transactions.slice(0, 30).map((tx) => ({
          merchant: tx.merchant,
          amount: tx.amount,
          category: tx.categorySlug,
          occurredAt: tx.occurredAt,
          tags: tx.tags,
        })),
      },
    });

    const aiMsg: Message = {
      id: Date.now() + 1,
      role: "assistant",
      content: aiResult.ok ? aiResult.answer : fallbackAssistantAnswer(trimmed),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)] pt-6">
      <div className="px-4 mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-[#61A4F4] to-[#30E48D] flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-white text-[18px] tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              AI Assistant
            </h1>
            <p className="text-[#30E48D] text-[12px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#30E48D] inline-block" />
              Online
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-[18px] text-[14px] ${
                msg.role === "user" ? "rounded-br-[6px]" : "rounded-bl-[6px]"
              }`}
              style={{
                background: msg.role === "user" ? "#CEF62E" : "#1A1620",
                color: msg.role === "user" ? "#0D0A0F" : "#FFFFFF",
                border: msg.role === "assistant" ? "1px solid rgba(255,255,255,0.06)" : "none",
                lineHeight: 1.6,
                whiteSpace: "pre-line",
              }}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div
              className="px-4 py-3 rounded-[18px] rounded-bl-[6px] flex gap-1.5 items-center"
              style={{ background: "#1A1620", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-[#8A8494]"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {messages.length <= 1 && (
          <div className="mt-4">
            <p className="text-[#8A8494] text-[12px] mb-3 px-1">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => {
                    void sendMessage(prompt);
                  }}
                  className="px-3 py-2 rounded-[14px] text-[13px] text-[#CEF62E] transition-all hover:scale-[1.02] active:scale-95"
                  style={{
                    background: "rgba(206, 246, 46, 0.08)",
                    border: "1px solid rgba(206, 246, 46, 0.15)",
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0 px-4 py-3 pb-28">
        <div
          className="flex items-center gap-2 p-1.5 pl-4 rounded-[18px]"
          style={{ background: "#1A1620", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void sendMessage(input);
              }
            }}
            placeholder="Ask about your finances..."
            className="flex-1 bg-transparent text-white placeholder:text-[#3D3849] focus:outline-none text-[14px]"
          />
          <button
            onClick={() => {
              void sendMessage(input);
            }}
            disabled={isTyping}
            className="w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0 transition-all active:scale-90 disabled:opacity-60"
            style={{ background: input.trim() ? "#CEF62E" : "rgba(255,255,255,0.05)" }}
          >
            <ArrowUp size={16} style={{ color: input.trim() ? "#0D0A0F" : "#8A8494" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
