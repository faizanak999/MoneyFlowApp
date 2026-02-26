import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, ArrowUp, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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

const mockResponses: Record<string, string> = {
  food: "Based on your transactions, you spent **Rs. 247.32** on food & drink last week. That's 15% more than the previous week. Your top spending was at Whole Foods (Rs. 67.43) and Chipotle (Rs. 14.85). Want me to suggest ways to reduce food costs?",
  biggest:
    "Your biggest expense this month is **Rent** at Rs. 1,850.00, followed by **Groceries** at Rs. 842.00 and **Utilities** at Rs. 926.00. Your rent accounts for 32% of your total spending.",
  compare:
    "Great news! You've spent **12% less** this month compared to last month (Rs. 2,847 vs Rs. 3,235). The biggest savings came from Shopping (-28%) and Entertainment (-35%). Keep it up! 🎉",
  subscription:
    "Here are your active subscriptions:\n\n• Netflix — Rs. 15.99/mo\n• Spotify — Rs. 9.99/mo\n• Gym — Rs. 49.99/mo\n• Coursera — Rs. 39.00/mo\n• iCloud — Rs. 2.99/mo\n\n**Total: Rs. 117.96/month** (Rs. 1,415.52/year)",
  budget:
    "You've used **81%** of your Rs. 3,500 monthly budget with 3 days left. You have Rs. 652.38 remaining. At your current pace, you might go over by ~Rs. 85. Consider reducing discretionary spending this weekend.",
  cut: "Based on your spending patterns, here are my top suggestions:\n\n1. 🍔 **Dining out** — You spend ~Rs. 180/week eating out. Cooking 2 more meals at home could save Rs. 120/mo\n2. ☕ **Daily coffee** — Rs. 6.75/day at Starbucks = Rs. 202/mo. A home brew setup pays for itself in 2 weeks\n3. 🛍️ **Impulse shopping** — 40% of your Amazon orders are under Rs. 20. Try a 24-hour rule before buying",
};

function getAIResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("food") || lower.includes("eat") || lower.includes("dinner"))
    return mockResponses.food;
  if (lower.includes("biggest") || lower.includes("largest") || lower.includes("most"))
    return mockResponses.biggest;
  if (lower.includes("compare") || lower.includes("last month") || lower.includes("versus"))
    return mockResponses.compare;
  if (lower.includes("subscription") || lower.includes("recurring"))
    return mockResponses.subscription;
  if (lower.includes("budget") || lower.includes("track") || lower.includes("on track"))
    return mockResponses.budget;
  if (lower.includes("cut") || lower.includes("save") || lower.includes("reduce"))
    return mockResponses.cut;
  return "I analyzed your recent spending patterns. Your average daily spend is Rs. 94.92, with most expenses falling in the Food & Drink and Bills categories. Would you like me to dive deeper into any specific area?";
}

export function AIAssistantScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 0,
      role: "assistant",
      content:
        "Hi! I'm your AI finance assistant. Ask me anything about your spending, budgets, or financial goals. 💰",
      timestamp: "Now",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: getAIResponse(text),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)] pt-6">
      {/* Header */}
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

      {/* Messages area */}
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
                background:
                  msg.role === "user"
                    ? "#CEF62E"
                    : "#1A1620",
                color: msg.role === "user" ? "#0D0A0F" : "#FFFFFF",
                border:
                  msg.role === "assistant" ? "1px solid rgba(255,255,255,0.06)" : "none",
                lineHeight: 1.6,
                whiteSpace: "pre-line",
              }}
            >
              {msg.content}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
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

        {/* Suggested prompts */}
        {messages.length <= 1 && (
          <div className="mt-4">
            <p className="text-[#8A8494] text-[12px] mb-3 px-1">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
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

      {/* Input area */}
      <div className="shrink-0 px-4 py-3 pb-28">
        <div
          className="flex items-center gap-2 p-1.5 pl-4 rounded-[18px]"
          style={{
            background: "#1A1620",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
            placeholder="Ask about your finances..."
            className="flex-1 bg-transparent text-white placeholder:text-[#3D3849] focus:outline-none text-[14px]"
          />
          <button
            onClick={() => sendMessage(input)}
            className="w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0 transition-all active:scale-90"
            style={{
              background: input.trim() ? "#CEF62E" : "rgba(255,255,255,0.05)",
            }}
          >
            <ArrowUp
              size={16}
              style={{ color: input.trim() ? "#0D0A0F" : "#8A8494" }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}