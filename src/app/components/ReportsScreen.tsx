import { useMemo, useState } from "react";
import { ChevronDown, TrendingDown, TrendingUp, ArrowUpRight } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Tooltip,
  Area,
  AreaChart,
} from "recharts";
import { useFinanceData } from "../hooks/useFinanceData";
import {
  getCategoryBreakdown,
  getMonthKey,
  getMonthlySpent,
  getMonthSeries,
  getWeeklySeries,
} from "../domain/finance";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-[10px] text-[12px]"
        style={{
          background: "#1A1620",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#fff",
        }}
      >
        <p className="text-[#8A8494]">{label}</p>
        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
          Rs. {Number(payload[0].value).toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function ReportsScreen() {
  const [activeTab, setActiveTab] = useState<"monthly" | "weekly">("monthly");
  const { snapshot } = useFinanceData();

  const monthKey = getMonthKey();
  const prevMonthKey = getMonthKey(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1));

  const monthlySeries = useMemo(() => getMonthSeries(snapshot.transactions, 6), [snapshot.transactions]);
  const weeklySeries = useMemo(() => getWeeklySeries(snapshot.transactions), [snapshot.transactions]);
  const categoryBreakdown = useMemo(
    () => getCategoryBreakdown(snapshot.categories, snapshot.transactions, monthKey),
    [snapshot.categories, snapshot.transactions, monthKey],
  );

  const totalSpent = useMemo(() => getMonthlySpent(snapshot.transactions, monthKey), [snapshot.transactions, monthKey]);
  const prevMonthSpent = useMemo(
    () => getMonthlySpent(snapshot.transactions, prevMonthKey),
    [snapshot.transactions, prevMonthKey],
  );

  const saved = Math.max(snapshot.monthlyBudget.amount - totalSpent, 0);
  const avgPerDay = totalSpent / Math.max(new Date().getDate(), 1);
  const spentTrend = prevMonthSpent > 0 ? Math.round(((prevMonthSpent - totalSpent) / prevMonthSpent) * 100) : 0;
  const savedTrend = snapshot.monthlyBudget.amount > 0 ? Math.round((saved / snapshot.monthlyBudget.amount) * 100) : 0;

  const total = categoryBreakdown.reduce((s, c) => s + c.value, 0);

  return (
    <div className="flex flex-col gap-5 pb-28 px-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-[22px] tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Reports
        </h1>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-white/5 text-[#8A8494] text-[13px]">
          {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })} <ChevronDown size={14} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Spent", value: `Rs. ${Math.round(totalSpent).toLocaleString()}`, trend: `${Math.abs(spentTrend)}%`, positive: spentTrend >= 0 },
          { label: "Saved", value: `Rs. ${Math.round(saved).toLocaleString()}`, trend: `${savedTrend}%`, positive: true },
          { label: "Avg/Day", value: `Rs. ${Math.round(avgPerDay).toLocaleString()}`, trend: `${Math.max(spentTrend, 0)}%`, positive: true },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[14px] p-3 text-center"
            style={{ background: "#1A1620", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <p className="text-[#8A8494] text-[11px] mb-1">{stat.label}</p>
            <p className="text-white text-[16px]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
              {stat.value}
            </p>
            <span className="text-[10px] flex items-center justify-center gap-0.5 mt-1" style={{ color: stat.positive ? "#30E48D" : "#F4618A" }}>
              {stat.positive ? <TrendingDown size={10} /> : <TrendingUp size={10} />}
              {stat.trend}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-[20px] p-4" style={{ background: "#1A1620", border: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-[15px]" style={{ fontWeight: 500 }}>Spending Trend</h3>
          <div className="flex rounded-[10px] overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
            <button
              onClick={() => setActiveTab("monthly")}
              className="px-3 py-1 text-[12px] transition-all"
              style={{
                background: activeTab === "monthly" ? "#CEF62E" : "transparent",
                color: activeTab === "monthly" ? "#0D0A0F" : "#8A8494",
                fontWeight: activeTab === "monthly" ? 600 : 400,
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setActiveTab("weekly")}
              className="px-3 py-1 text-[12px] transition-all"
              style={{
                background: activeTab === "weekly" ? "#CEF62E" : "transparent",
                color: activeTab === "weekly" ? "#0D0A0F" : "#8A8494",
                fontWeight: activeTab === "weekly" ? 600 : 400,
              }}
            >
              Weekly
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          {activeTab === "monthly" ? (
            <BarChart data={monthlySeries} barSize={24}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#8A8494", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {monthlySeries.map((_, index) => (
                  <Cell key={index} fill={index === monthlySeries.length - 1 ? "#CEF62E" : "rgba(206, 246, 46, 0.2)"} />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <AreaChart data={weeklySeries}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#CEF62E" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#CEF62E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "#8A8494", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="amount" stroke="#CEF62E" fill="url(#colorAmount)" strokeWidth={2} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="rounded-[20px] p-4" style={{ background: "#1A1620", border: "1px solid rgba(255,255,255,0.04)" }}>
        <h3 className="text-white text-[15px] mb-4" style={{ fontWeight: 500 }}>By Category</h3>
        <div className="flex items-center gap-4">
          <div className="w-[120px] h-[120px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {categoryBreakdown.map((entry) => (
                    <Cell key={entry.slug} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 flex flex-col gap-2.5">
            {categoryBreakdown.map((cat) => (
              <div key={cat.slug} className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
                <span className="text-[#8A8494] text-[13px] flex-1">{cat.label}</span>
                <span className="text-white text-[13px]" style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 500 }}>
                  Rs. {Math.round(cat.value).toLocaleString()}
                </span>
                <span className="text-[#8A8494] text-[11px] w-8 text-right">{total > 0 ? Math.round((cat.value / total) * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[20px] p-4" style={{ background: "#1A1620", border: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-[15px]" style={{ fontWeight: 500 }}>Savings History</h3>
          <span className="text-[#30E48D] text-[12px] flex items-center gap-1">
            <TrendingUp size={12} /> On track
          </span>
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={monthlySeries.map((point) => ({ month: point.month, saved: Math.max(snapshot.monthlyBudget.amount - point.amount, 0) }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#8A8494", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="saved"
              stroke="#30E48D"
              strokeWidth={2}
              dot={{ fill: "#30E48D", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#30E48D", strokeWidth: 2, stroke: "#0D0A0F" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-white text-[15px] px-1" style={{ fontWeight: 500 }}>Insights</h3>
        {[
          {
            title: spentTrend >= 0 ? `You spent ${spentTrend}% less than last month` : `You spent ${Math.abs(spentTrend)}% more than last month`,
            description: spentTrend >= 0 ? "Current pace is improving." : "Review high-cost categories to rebalance.",
            color: spentTrend >= 0 ? "#30E48D" : "#F4C761",
          },
          {
            title: `You have Rs. ${Math.round(saved).toLocaleString()} left in budget`,
            description: "Track this against upcoming recurring bills.",
            color: "#61A4F4",
          },
        ].map((insight) => (
          <div
            key={insight.title}
            className="flex items-start gap-3 p-4 rounded-[16px]"
            style={{ background: "#1A1620", border: "1px solid rgba(255,255,255,0.04)" }}
          >
            <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: insight.color }} />
            <div className="flex-1">
              <p className="text-white text-[14px]">{insight.title}</p>
              <p className="text-[#8A8494] text-[12px] mt-0.5">{insight.description}</p>
            </div>
            <ArrowUpRight size={16} className="text-[#8A8494] shrink-0 mt-0.5" />
          </div>
        ))}
      </div>
    </div>
  );
}
