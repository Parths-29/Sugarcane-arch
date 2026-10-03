import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, TrendingUp, Droplets, IndianRupee,
  Wheat, Download, Calendar, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PieChart } from "@/components/charts/PieChart";
import { BarChart } from "@/components/charts/BarChart";
import { LineChart } from "@/components/charts/LineChart";

/* ── Mock Report Data ── */
const CURRENT_SEASON = {
  name: "2025-26 (Suru Season)",
  totalPlots: 8,
  totalArea: 42, // acres
  totalYield: 1890, // tonnes
  targetYield: 2000,
  avgYieldPerAcre: 45,
  totalRevenue: 4536000, // ₹45.36L
  totalCost: 1764000, // ₹17.64L
  waterUsed: 7560, // kilo litres
  waterTarget: 9000,
};

const PREV_SEASON = {
  name: "2024-25",
  totalYield: 1680,
  avgYieldPerAcre: 40,
  totalRevenue: 3864000,
  totalCost: 1680000,
  waterUsed: 8820,
};

const MONTHLY_REVENUE = [
  { label: "Oct", value: 0 }, { label: "Nov", value: 120 }, { label: "Dec", value: 380 },
  { label: "Jan", value: 650 }, { label: "Feb", value: 920 }, { label: "Mar", value: 1200 },
  { label: "Apr", value: 1580 }, { label: "May", value: 1950 }, { label: "Jun", value: 2400 },
  { label: "Jul", value: 3100 }, { label: "Aug", value: 3800 }, { label: "Sep", value: 4536 },
];

const PLOT_PERFORMANCE = [
  { label: "Plot A", value: 48, color: "#22c55e" },
  { label: "Plot B", value: 44, color: "#22c55e" },
  { label: "Plot C", value: 46, color: "#22c55e" },
  { label: "Plot D", value: 42, color: "#f59e0b" },
  { label: "Plot E", value: 50, color: "#22c55e" },
  { label: "Plot F", value: 38, color: "#ef4444" },
  { label: "Plot G", value: 47, color: "#22c55e" },
  { label: "Plot H", value: 45, color: "#22c55e" },
];

const EXPENSE_PIE = [
  { label: "Fertilizers", value: 357000, color: "#3b82f6" },
  { label: "Labor", value: 504000, color: "#f59e0b" },
  { label: "Irrigation", value: 210000, color: "#06b6d4" },
  { label: "Seeds/Setts", value: 252000, color: "#22c55e" },
  { label: "Pesticides", value: 147000, color: "#ef4444" },
  { label: "Transport", value: 168000, color: "#8b5cf6" },
  { label: "Miscellaneous", value: 126000, color: "#ec4899" },
];

const WATER_SOURCE = [
  { label: "Drip", value: 3200, color: "#06b6d4" },
  { label: "Furrow", value: 2100, color: "#3b82f6" },
  { label: "Rainfall", value: 1800, color: "#22c55e" },
  { label: "Sprinkler", value: 460, color: "#8b5cf6" },
];

function pctChange(curr: number, prev: number) {
  return ((curr - prev) / prev * 100).toFixed(1);
}

function KPICard({ icon: Icon, label, value, suffix, prevValue, gradient, delay }: {
  icon: any; label: string; value: number; suffix?: string; prevValue?: number; gradient: string; delay: number;
}) {
  const change = prevValue ? Number(pctChange(value, prevValue)) : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-lg p-5"
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg`}>
          <Icon size={18} className="text-neutral-900 dark:text-white" />
        </div>
        {change !== null && (
          <div className={`flex items-center gap-0.5 text-xs font-bold ${change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-black text-neutral-900 dark:text-white mt-3 tracking-tight">
        {suffix === "₹" ? `₹${(value / 100000).toFixed(2)}L` : suffix === "t" ? `${value.toLocaleString()}t` : suffix === "kL" ? `${(value / 1000).toFixed(1)}k L` : value.toString()}
      </p>
      <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium mt-1">{label}</p>
    </motion.div>
  );
}

export default function Reports() {
  const [activeTab, setActiveTab] = useState<"overview" | "comparison">("overview");
  const profit = CURRENT_SEASON.totalRevenue - CURRENT_SEASON.totalCost;
  const profitMargin = (profit / CURRENT_SEASON.totalRevenue * 100).toFixed(1);

  const handleDownload = () => {
    const report = `
═══════════════════════════════════════
       DesiCane FARM REPORT
       ${CURRENT_SEASON.name}
═══════════════════════════════════════

SUMMARY
-------
Total Plots: ${CURRENT_SEASON.totalPlots}
Total Area: ${CURRENT_SEASON.totalArea} acres
Total Yield: ${CURRENT_SEASON.totalYield} tonnes
Avg Yield/Acre: ${CURRENT_SEASON.avgYieldPerAcre} t/acre
Target: ${CURRENT_SEASON.targetYield} tonnes
Achievement: ${(CURRENT_SEASON.totalYield / CURRENT_SEASON.targetYield * 100).toFixed(1)}%

FINANCIALS
----------
Total Revenue: ₹${(CURRENT_SEASON.totalRevenue / 100000).toFixed(2)} Lakhs
Total Cost: ₹${(CURRENT_SEASON.totalCost / 100000).toFixed(2)} Lakhs
Net Profit: ₹${(profit / 100000).toFixed(2)} Lakhs
Profit Margin: ${profitMargin}%

WATER USAGE
-----------
Total: ${CURRENT_SEASON.waterUsed} kilo litres
Target: ${CURRENT_SEASON.waterTarget} kL
Savings: ${((1 - CURRENT_SEASON.waterUsed / CURRENT_SEASON.waterTarget) * 100).toFixed(1)}%

Generated by DesiCane | ${new Date().toLocaleDateString("en-IN")}
    `.trim();

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `DesiCane_Report_${CURRENT_SEASON.name.replace(/\s/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container bg-neutral-50 dark:bg-neutral-950 min-h-screen transition-colors duration-300">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#f5f5dc]/40 dark:bg-neutral-900 py-16 px-4">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px]" />
          </div>
          <div className="relative max-w-[1200px] mx-auto flex items-start justify-between flex-wrap gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-black/5 dark:bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center border border-neutral-200 dark:border-white/10">
                  <FileText size={24} className="text-neutral-900 dark:text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                  Farm Reports
                </h1>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-2xl">
                Seasonal performance dashboard — yield, revenue, costs, and water usage analysis.
              </p>
            </motion.div>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={handleDownload}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              <Download size={16} /> Download Report
            </motion.button>
          </div>
        </section>

        <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-6">
          {/* Season Header */}
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <Calendar size={14} />
            <span className="font-semibold">{CURRENT_SEASON.name}</span>
            <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-bold">Active</span>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard icon={Wheat} label="Total Yield" value={CURRENT_SEASON.totalYield} suffix="t" prevValue={PREV_SEASON.totalYield} gradient="from-green-500 to-emerald-600" delay={0} />
            <KPICard icon={IndianRupee} label="Total Revenue" value={CURRENT_SEASON.totalRevenue} suffix="₹" prevValue={PREV_SEASON.totalRevenue} gradient="from-blue-500 to-indigo-600" delay={0.1} />
            <KPICard icon={TrendingUp} label="Net Profit" value={profit} suffix="₹" prevValue={PREV_SEASON.totalRevenue - PREV_SEASON.totalCost} gradient="from-emerald-500 to-green-600" delay={0.2} />
            <KPICard icon={Droplets} label="Water Used" value={CURRENT_SEASON.waterUsed} suffix="kL" prevValue={PREV_SEASON.waterUsed} gradient="from-cyan-500 to-blue-600" delay={0.3} />
          </div>

          {/* Achievement Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300">Yield Achievement</h3>
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                {(CURRENT_SEASON.totalYield / CURRENT_SEASON.targetYield * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-4 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, CURRENT_SEASON.totalYield / CURRENT_SEASON.targetYield * 100)}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-neutral-400">0t</span>
              <span className="text-xs text-neutral-400">Target: {CURRENT_SEASON.targetYield}t</span>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2">
            {[
              { key: "overview" as const, label: "Overview" },
              { key: "comparison" as const, label: "Season Comparison" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab.key
                  ? "bg-green-600 text-white shadow-lg shadow-green-600/20"
                  : "bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <>
              {/* Charts Grid */}
              <div className="grid lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-lg p-6"
                >
                  <BarChart data={PLOT_PERFORMANCE} title="Yield by Plot (t/acre)" height={220} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-lg p-6"
                >
                  <PieChart data={EXPENSE_PIE} title="Expense Breakdown" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-lg p-6"
                >
                  <LineChart
                    data={MONTHLY_REVENUE.map((d) => ({ label: d.label, value: d.value / 1000 }))}
                    title="Cumulative Revenue (₹ thousands)"
                    height={220}
                    lineColor="#3b82f6"
                    showDots={false}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-lg p-6"
                >
                  <PieChart data={WATER_SOURCE} title="Water Source Distribution (kL)" />
                </motion.div>
              </div>
            </>
          )}

          {activeTab === "comparison" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-lg p-6"
            >
              <h3 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
                Season-over-Season Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-200 dark:border-neutral-700">
                      <th className="text-left py-3 px-3 text-xs font-bold text-neutral-500 uppercase">Metric</th>
                      <th className="text-right py-3 px-3 text-xs font-bold text-neutral-500 uppercase">{PREV_SEASON.name}</th>
                      <th className="text-right py-3 px-3 text-xs font-bold text-neutral-500 uppercase">{CURRENT_SEASON.name}</th>
                      <th className="text-right py-3 px-3 text-xs font-bold text-neutral-500 uppercase">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { metric: "Total Yield", prev: `${PREV_SEASON.totalYield}t`, curr: `${CURRENT_SEASON.totalYield}t`, change: Number(pctChange(CURRENT_SEASON.totalYield, PREV_SEASON.totalYield)) },
                      { metric: "Avg Yield/Acre", prev: `${PREV_SEASON.avgYieldPerAcre}t`, curr: `${CURRENT_SEASON.avgYieldPerAcre}t`, change: Number(pctChange(CURRENT_SEASON.avgYieldPerAcre, PREV_SEASON.avgYieldPerAcre)) },
                      { metric: "Revenue", prev: `₹${(PREV_SEASON.totalRevenue / 100000).toFixed(2)}L`, curr: `₹${(CURRENT_SEASON.totalRevenue / 100000).toFixed(2)}L`, change: Number(pctChange(CURRENT_SEASON.totalRevenue, PREV_SEASON.totalRevenue)) },
                      { metric: "Cost", prev: `₹${(PREV_SEASON.totalCost / 100000).toFixed(2)}L`, curr: `₹${(CURRENT_SEASON.totalCost / 100000).toFixed(2)}L`, change: Number(pctChange(CURRENT_SEASON.totalCost, PREV_SEASON.totalCost)) },
                      { metric: "Profit", prev: `₹${((PREV_SEASON.totalRevenue - PREV_SEASON.totalCost) / 100000).toFixed(2)}L`, curr: `₹${(profit / 100000).toFixed(2)}L`, change: Number(pctChange(profit, PREV_SEASON.totalRevenue - PREV_SEASON.totalCost)) },
                      { metric: "Water Used", prev: `${PREV_SEASON.waterUsed} kL`, curr: `${CURRENT_SEASON.waterUsed} kL`, change: Number(pctChange(CURRENT_SEASON.waterUsed, PREV_SEASON.waterUsed)) },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                        <td className="py-3 px-3 font-semibold text-neutral-800 dark:text-white">{row.metric}</td>
                        <td className="py-3 px-3 text-right text-neutral-500 dark:text-neutral-400">{row.prev}</td>
                        <td className="py-3 px-3 text-right font-semibold text-neutral-900 dark:text-white">{row.curr}</td>
                        <td className="py-3 px-3 text-right">
                          <span className={`inline-flex items-center gap-0.5 text-xs font-bold ${(row.metric === "Water Used" || row.metric === "Cost")
                            ? row.change <= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            : row.change >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            }`}>
                            {row.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {Math.abs(row.change)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-green-800 to-emerald-900 rounded-2xl p-6 text-white shadow-xl"
          >
            <h3 className="text-sm font-bold uppercase tracking-wider text-green-200/60 mb-4">Season Summary</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-3xl font-black">{CURRENT_SEASON.totalPlots}</p>
                <p className="text-sm text-green-200/70">Active Plots</p>
              </div>
              <div>
                <p className="text-3xl font-black">{CURRENT_SEASON.totalArea}</p>
                <p className="text-sm text-green-200/70">Total Acres</p>
              </div>
              <div>
                <p className="text-3xl font-black">{profitMargin}%</p>
                <p className="text-sm text-green-200/70">Profit Margin</p>
              </div>
              <div>
                <p className="text-3xl font-black">{((1 - CURRENT_SEASON.waterUsed / CURRENT_SEASON.waterTarget) * 100).toFixed(0)}%</p>
                <p className="text-sm text-green-200/70">Water Saved</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
