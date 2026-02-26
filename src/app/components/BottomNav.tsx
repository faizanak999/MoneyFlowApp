import { useNavigate, useLocation } from "react-router";
import { Home, BookOpen, Sparkles, BarChart3 } from "lucide-react";

const navItems = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/ledger", icon: BookOpen, label: "Ledger" },
  { path: "/assistant", icon: Sparkles, label: "AI" },
  { path: "/reports", icon: BarChart3, label: "Reports" },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 px-4">
      <nav
        className="flex items-center justify-around w-full max-w-[400px] px-3 py-2 rounded-[24px]"
        style={{
          background: "rgba(26, 22, 32, 0.65)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-5 py-2 rounded-[16px] transition-all duration-300 ${
                isActive
                  ? "bg-[#CEF62E] text-[#0D0A0F]"
                  : "text-[#8A8494] hover:text-white"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-[10px] tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
