import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Droplets,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Thermometer,
  CloudRain,
  BarChart2,
} from "lucide-react";
import { getAdvisory } from "@/api/advisory";
import type {
  AdvisoryRequest,
  AdvisoryResponse,
  GrowthStage,
  Language,
} from "@/api/advisory";
import { login } from "@/api/auth";
import { ApiClientError } from "@/api/client";

const ARCH_MODE = (import.meta.env.VITE_ARCH_MODE as string) || "monolith";
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:4000";

const ARCH_COLORS: Record<string, string> = {
  monolith: "from-blue-600 to-indigo-700",
  "three-tier": "from-emerald-600 to-teal-700",
  microservices: "from-violet-600 to-purple-700",
};

const ARCH_BADGE: Record<string, string> = {
  monolith: "bg-blue-100 text-blue-800 border-blue-200",
  "three-tier": "bg-emerald-100 text-emerald-800 border-emerald-200",
  microservices: "bg-violet-100 text-violet-800 border-violet-200",
};

const gradientClass = ARCH_COLORS[ARCH_MODE] ?? ARCH_COLORS.monolith;
const badgeClass = ARCH_BADGE[ARCH_MODE] ?? ARCH_BADGE.monolith;

const GROWTH_STAGES: { value: GrowthStage; label: string }[] = [
  { value: "germination", label: "Germination" },
  { value: "tillering", label: "Tillering" },
  { value: "grand_growth", label: "Grand Growth" },
  { value: "maturity", label: "Maturity" },
];

const LANGUAGES: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "kn", label: "Kannada (ಕನ್ನಡ)" },
  { value: "hi", label: "Hindi (हिंदी)" },
  { value: "mr", label: "Marathi (मराठी)" },
  { value: "ta", label: "Tamil (தமிழ்)" },
  { value: "te", label: "Telugu (తెలుగు)" },
];

const DECISION_STYLES: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
  irrigate: {
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-800",
    icon: <Droplets className="w-5 h-5 text-blue-500" />,
    label: "Irrigate Now",
  },
  delay: {
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-800",
    icon: <Clock className="w-5 h-5 text-amber-500" />,
    label: "Delay Irrigation",
  },
  skip: {
    bg: "bg-green-50 border-green-200",
    text: "text-green-800",
    icon: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    label: "Skip — No Need",
  },
};

interface LoginState {
  phone: string;
  password: string;
  loggedIn: boolean;
  error: string | null;
  loading: boolean;
}

export default function ArchDemo() {
  const [loginState, setLoginState] = useState<LoginState>({
    phone: "",
    password: "",
    loggedIn: false,
    error: null,
    loading: false,
  });

  const [form, setForm] = useState<AdvisoryRequest>({
    growthStage: "tillering",
    soilMoisturePct: 40,
    village: "Athani",
    language: "en",
  });

  const [result, setResult] = useState<AdvisoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [burstLoading, setBurstLoading] = useState(false);
  const [burstProgress, setBurstProgress] = useState<string | null>(null);
  const [burstError, setBurstError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginState((s) => ({ ...s, loading: true, error: null }));
    try {
      await login({ phone: loginState.phone, password: loginState.password });
      setLoginState((s) => ({ ...s, loggedIn: true, loading: false }));
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : "Login failed";
      setLoginState((s) => ({ ...s, error: msg, loading: false }));
    }
  }, [loginState.phone, loginState.password]);

  const handleAdvisory = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    const t0 = performance.now();
    try {
      const res = await getAdvisory(form);
      const elapsed = Math.round(performance.now() - t0);
      setResponseTimeMs(elapsed);
      setResult(res);
    } catch (err) {
      const msg = err instanceof ApiClientError ? `${err.code}: ${err.message}` : "Request failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [form]);

  const generateDashboardTraffic = useCallback(async () => {
    const samples: Array<{ growthStage: GrowthStage; soilMoisturePct: number }> = [
      { growthStage: "germination", soilMoisturePct: 18 },
      { growthStage: "tillering", soilMoisturePct: 32 },
      { growthStage: "grand_growth", soilMoisturePct: 48 },
      { growthStage: "maturity", soilMoisturePct: 72 },
      { growthStage: "tillering", soilMoisturePct: 20 },
      { growthStage: "grand_growth", soilMoisturePct: 28 },
      { growthStage: "maturity", soilMoisturePct: 55 },
      { growthStage: "germination", soilMoisturePct: 65 },
      { growthStage: "grand_growth", soilMoisturePct: 24 },
      { growthStage: "tillering", soilMoisturePct: 58 },
      { growthStage: "maturity", soilMoisturePct: 36 },
      { growthStage: "germination", soilMoisturePct: 44 },
    ];

    setBurstLoading(true);
    setBurstError(null);
    setBurstProgress("Starting live traffic...");
    try {
      for (let i = 0; i < samples.length; i++) {
        const response = await getAdvisory({ ...form, ...samples[i] });
        if (!response.notificationQueued) {
          throw new Error("Advisory completed, but Redis did not queue its notification. Check the Redis connection.");
        }
        setBurstProgress(`Sent ${i + 1} of ${samples.length} advisories and queued notifications.`);
      }
      setBurstProgress(`Done: ${samples.length} live advisories sent. Refresh the Grafana dashboard.`);
    } catch (err) {
      setBurstError(err instanceof ApiClientError ? `${err.code}: ${err.message}` : err instanceof Error ? err.message : "Traffic generation failed. Check the backend and login.");
    } finally {
      setBurstLoading(false);
    }
  }, [form]);

  const decisionStyle = result ? (DECISION_STYLES[result.decision] ?? DECISION_STYLES.skip) : null;

  return (
    <div className="min-h-screen bg-gray-50 font-['Inter',sans-serif]">
      {/* Header */}
      <div className={`bg-gradient-to-r ${gradientClass} text-white py-8 px-4 shadow-lg`}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6" />
            <h1 className="text-2xl font-bold">Architecture Demo</h1>
            <span
              className={`ml-2 text-xs font-semibold border rounded-full px-3 py-1 ${badgeClass}`}
            >
              {ARCH_MODE}
            </span>
          </div>
          <p className="text-white/80 text-sm">
            Backend: <code className="bg-white/20 rounded px-2 py-0.5">{API_BASE}</code>
          </p>
          <p className="text-white/70 text-xs mt-1">
            Isolated demo route – not linked from navigation
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Step 1: Login */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center font-bold">1</span>
            Authenticate (POST /api/auth/login)
          </h2>

          {loginState.loggedIn ? (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">Logged in – JWT stored in localStorage</span>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="flex flex-col sm:flex-row gap-3">
              <input
                id="demo-phone"
                type="tel"
                placeholder="Phone (e.g. 9876543210)"
                value={loginState.phone}
                onChange={(e) => setLoginState((s) => ({ ...s, phone: e.target.value }))}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                id="demo-password"
                type="password"
                placeholder="Password"
                value={loginState.password}
                onChange={(e) => setLoginState((s) => ({ ...s, password: e.target.value }))}
                className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                id="demo-login-submit"
                type="submit"
                disabled={loginState.loading}
                className={`px-5 py-2.5 rounded-xl text-white text-sm font-semibold bg-gradient-to-r ${gradientClass} hover:opacity-90 transition disabled:opacity-60`}
              >
                {loginState.loading ? "..." : "Login"}
              </button>
            </form>
          )}

          {loginState.error && (
            <p className="mt-2 text-sm text-red-600">{loginState.error}</p>
          )}
        </motion.div>

        {/* Step 2: Advisory form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        >
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center font-bold">2</span>
            Field Details (POST /api/advisory)
          </h2>

          <form onSubmit={handleAdvisory} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Growth Stage */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Growth Stage
                </label>
                <select
                  id="demo-growth-stage"
                  value={form.growthStage}
                  onChange={(e) => setForm((f) => ({ ...f, growthStage: e.target.value as GrowthStage }))}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {GROWTH_STAGES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Language
                </label>
                <select
                  id="demo-language"
                  value={form.language}
                  onChange={(e) => setForm((f) => ({ ...f, language: e.target.value as Language }))}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Soil Moisture */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Soil Moisture: {form.soilMoisturePct}%
                </label>
                <input
                  id="demo-soil-moisture"
                  type="range"
                  min={0}
                  max={100}
                  value={form.soilMoisturePct}
                  onChange={(e) => setForm((f) => ({ ...f, soilMoisturePct: Number(e.target.value) }))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0% (Dry)</span>
                  <span>100% (Saturated)</span>
                </div>
              </div>

              {/* Village */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Village
                </label>
                <input
                  id="demo-village"
                  type="text"
                  value={form.village}
                  onChange={(e) => setForm((f) => ({ ...f, village: e.target.value }))}
                  placeholder="e.g. Athani, Bagalkot"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              id="demo-advisory-submit"
              type="submit"
              disabled={loading || !loginState.loggedIn}
              className={`w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r ${gradientClass} hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Computing advisory...
                </>
              ) : (
                <>
                  <Droplets className="w-4 h-4" />
                  Get Irrigation Advisory
                </>
              )}
            </button>
            {!loginState.loggedIn && (
              <p className="text-xs text-center text-gray-400">Login first to use this feature</p>
            )}
            {ARCH_MODE === "microservices" && <div className="mt-4 border-t border-gray-100 pt-4">
              <button
                id="demo-grafana-traffic"
                type="button"
                onClick={generateDashboardTraffic}
                disabled={!loginState.loggedIn || burstLoading}
                className="w-full rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm font-semibold text-violet-800 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {burstLoading ? "Generating live metrics..." : "Generate Grafana Demo Traffic (12 requests)"}
              </button>
              <p className="mt-2 text-center text-xs text-gray-500">
                Sends real advisories through the gateway and queues mock notifications in Redis.
              </p>
              {burstProgress && <p aria-live="polite" className="mt-2 text-center text-xs text-emerald-700">{burstProgress}</p>}
              {burstError && <p role="alert" className="mt-2 text-center text-xs text-red-600">{burstError}</p>}
            </div>}
          </form>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-5 py-4"
          >
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </motion.div>
        )}

        {/* Result */}
        <AnimatePresence>
          {result && decisionStyle && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Decision banner */}
              <div className={`rounded-2xl border p-5 ${decisionStyle.bg}`}>
                <div className={`flex items-center gap-3 mb-3 ${decisionStyle.text}`}>
                  {decisionStyle.icon}
                  <span className="text-lg font-bold">{decisionStyle.label}</span>
                  {result.irrigationMm > 0 && (
                    <span className="ml-auto text-sm font-semibold bg-white/60 rounded-lg px-3 py-1">
                      {result.irrigationMm.toFixed(1)} mm
                    </span>
                  )}
                </div>
                <p className={`text-sm leading-relaxed ${decisionStyle.text}`}>
                  {result.explanation}
                </p>
                {result.staleWeather && (
                  <div className="mt-3 flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Weather data is stale (circuit breaker open — using cached data)
                  </div>
                )}
              </div>

              {/* Weather + latency */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <CloudRain className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Rain (3d)</p>
                  <p className="text-lg font-bold text-gray-800">{result.weather.rain3dMm.toFixed(1)}<span className="text-xs font-normal text-gray-500"> mm</span></p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <Thermometer className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Temp Max</p>
                  <p className="text-lg font-bold text-gray-800">{result.weather.tempMaxC.toFixed(1)}<span className="text-xs font-normal text-gray-500"> °C</span></p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <Droplets className="w-5 h-5 text-teal-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">ET₀</p>
                  <p className="text-lg font-bold text-gray-800">{result.weather.et0Mm.toFixed(2)}<span className="text-xs font-normal text-gray-500"> mm</span></p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                  <Clock className="w-5 h-5 text-violet-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Response</p>
                  <p className="text-lg font-bold text-gray-800">{responseTimeMs ?? result.latencyMs}<span className="text-xs font-normal text-gray-500"> ms</span></p>
                </div>
              </div>

              {/* Explanation features */}
              {result.explanationFeatures.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4" />
                    Top Features (SHAP)
                  </h3>
                  <div className="space-y-2">
                    {result.explanationFeatures.map((f, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 w-40 shrink-0">{f.feature}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500"
                            style={{
                              width: `${Math.min(100, Math.abs(f.contribution) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-mono text-gray-500 w-16 text-right">
                          {f.contribution.toFixed(3)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
