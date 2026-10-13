import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { register as promRegister, collectDefaultMetrics, Counter, Gauge, Histogram } from "prom-client";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import Redis from "ioredis";

collectDefaultMetrics({ prefix: "gateway_" });

const app = express();
const PORT = parseInt(process.env.PORT ?? "8000", 10);
const JWT_SECRET = process.env.JWT_SECRET ?? "changeme_dev_secret_32chars_min!!";

const AUTH_URL    = process.env.AUTH_SERVICE_URL    ?? "http://auth:8001";
const WEATHER_URL = process.env.WEATHER_SERVICE_URL ?? "http://weather:8002";
const ADVISORY_URL= process.env.ADVISORY_SERVICE_URL ?? "http://advisory:8003";
const TRANS_URL   = process.env.TRANSLATION_SERVICE_URL ?? "http://translation:8004";
const REDIS_URL   = process.env.REDIS_URL ?? "redis://redis:6379";
const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.8-flash";

const CB_FAILURE_THRESHOLD = parseInt(process.env.CB_FAILURE_THRESHOLD ?? "3", 10);
const CB_RESET_TIMEOUT_MS  = parseInt(process.env.CB_RESET_TIMEOUT_MS  ?? "30000", 10);
const CB_CALL_TIMEOUT_MS   = parseInt(process.env.CB_CALL_TIMEOUT_MS   ?? "8000", 10);

// ── Circuit Breaker ─────────────────────────────────────────────────────────
type CBState = "closed" | "open" | "half-open";
let cbState: CBState = "closed";
let cbFailures = 0;
let cbLastFailureAt = 0;

const cbStateGauge = new Gauge({ name: "circuit_breaker_state", help: "0=closed,1=open,2=half-open", labelNames: ["service"] });
cbStateGauge.set({ service: "weather" }, 0);
const cbFallbackTotal = new Counter({ name: "fallback_total", help: "Times stale cache used", labelNames: ["service"] });
const requestsTotal = new Counter({ name: "gateway_requests_total", help: "Total gateway requests", labelNames: ["method","route","status"] });
const notificationEnqueued = new Counter({ name: "notification_jobs_enqueued_total", help: "Advisory notification jobs added to the Redis stream" });
const notificationEnqueueErrors = new Counter({ name: "notification_enqueue_errors_total", help: "Failed attempts to enqueue advisory notifications" });
const inventoryActions = new Counter({ name: "inventory_actions_total", help: "Inventory actions recorded by the site or generated as synthetic demo traffic", labelNames: ["action", "category", "source"] });
const newsGenerationRequests = new Counter({ name: "news_generation_requests_total", help: "Gemini news generation requests", labelNames: ["result"] });
const newsArticlesGenerated = new Counter({ name: "news_articles_generated_total", help: "AI-generated news articles returned to the website" });
const newsGenerationDuration = new Histogram({ name: "news_generation_duration_seconds", help: "Gemini news generation request duration", buckets: [0.5, 1, 2, 5, 10, 20, 30] });
// Seed bounded label combinations at zero so Prometheus has a baseline before
// the first website action; otherwise a brand-new Counter series starts at 1
// and its first increase is invisible in short dashboard ranges.
for (const action of ["add", "edit", "delete"]) {
  for (const category of ["Fertilizer", "Machinery", "Seeds", "Pesticides", "Fuel"]) {
    for (const source of ["site", "demo"]) inventoryActions.inc({ action, category, source }, 0);
  }
}
newsGenerationRequests.inc({ result: "success" }, 0);
newsGenerationRequests.inc({ result: "error" }, 0);
const redis = new Redis(REDIS_URL, { maxRetriesPerRequest: 1, retryStrategy: (attempt) => Math.min(attempt * 250, 3000) });

function cbTick(success: boolean) {
  if (success) { cbFailures = 0; if (cbState !== "closed") { cbState = "closed"; cbStateGauge.set({ service: "weather" }, 0); } return; }
  cbFailures++;
  cbLastFailureAt = Date.now();
  if (cbFailures >= CB_FAILURE_THRESHOLD) { cbState = "open"; cbStateGauge.set({ service: "weather" }, 1); }
}

// Stale weather cache (in-memory, gateway level)
let staleWeatherCache: { rain3dMm: number; tempMaxC: number; et0Mm: number } | null = null;

async function fetchWithTimeout(url: string, opts: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CB_CALL_TIMEOUT_MS);
  try { return await fetch(url, { ...opts, signal: controller.signal }); }
  finally { clearTimeout(timer); }
}

async function callWeather(village: string): Promise<{ data: { rain3dMm: number; tempMaxC: number; et0Mm: number }; stale: boolean }> {
  // Check if breaker is open
  if (cbState === "open") {
    if (Date.now() - cbLastFailureAt > CB_RESET_TIMEOUT_MS) {
      cbState = "half-open";
      cbStateGauge.set({ service: "weather" }, 2);
    } else {
      if (staleWeatherCache) {
        cbFallbackTotal.inc({ service: "weather" });
        return { data: staleWeatherCache, stale: true };
      }
      throw { status: 503, code: "WEATHER_UNAVAILABLE", message: "Weather service unavailable and no cached data" };
    }
  }

  try {
    const res = await fetchWithTimeout(`${WEATHER_URL}/internal/weather?village=${encodeURIComponent(village)}`);
    if (!res.ok) throw new Error("Weather service error");
    const data = await res.json() as { rain3dMm: number; tempMaxC: number; et0Mm: number };
    staleWeatherCache = data;
    cbTick(true);
    return { data, stale: false };
  } catch {
    cbTick(false);
    if (staleWeatherCache) {
      cbFallbackTotal.inc({ service: "weather" });
      return { data: staleWeatherCache, stale: true };
    }
    throw { status: 503, code: "WEATHER_UNAVAILABLE", message: "Weather service unavailable and no cached data" };
  }
}

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request ID
app.use((req, _res, next) => {
  (req as express.Request & { requestId: string }).requestId = (req.headers["x-request-id"] as string) ?? uuidv4();
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? "60000", 10),
  max: parseInt(process.env.RATE_LIMIT_MAX ?? "100", 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: { code: "RATE_LIMITED", message: "Too many requests" },
});
app.use("/api/", limiter);

// JWT verification middleware
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) { res.status(401).json({ code: "UNAUTHORIZED", message: "Missing token" }); return; }
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { userId: string; phone: string };
    (req as express.Request & { userId: string; phone: string }).userId = payload.userId;
    (req as express.Request & { userId: string; phone: string }).phone = payload.phone;
    next();
  } catch { res.status(401).json({ code: "TOKEN_INVALID", message: "Invalid or expired token" }); }
}

// ── Routes ───────────────────────────────────────────────────────────────────
// Proxy auth routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const r = await fetchWithTimeout(`${AUTH_URL}/register`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(req.body) });
    const data = await r.json();
    requestsTotal.inc({ method: "POST", route: "/api/auth/register", status: String(r.status) });
    res.status(r.status).json(data);
  } catch { res.status(503).json({ code: "AUTH_UNAVAILABLE", message: "Auth service unavailable" }); }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const r = await fetchWithTimeout(`${AUTH_URL}/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(req.body) });
    const data = await r.json();
    requestsTotal.inc({ method: "POST", route: "/api/auth/login", status: String(r.status) });
    res.status(r.status).json(data);
  } catch { res.status(503).json({ code: "AUTH_UNAVAILABLE", message: "Auth service unavailable" }); }
});

// Advisory – aggregation endpoint (weather → advisory → translation)
app.post("/api/advisory", requireAuth, async (req, res) => {
  const t0 = Date.now();
  try {
    const { growthStage, soilMoisturePct, village, language } = req.body;

    // 1. Get weather (with circuit breaker)
    const { data: weatherData, stale: staleWeather } = await callWeather(village);

    // 2. Call advisory microservice
    const advRes = await fetchWithTimeout(`${ADVISORY_URL}/advisory`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ growthStage, soilMoisturePct, village, language, weather: weatherData }),
    });
    if (!advRes.ok) {
      const e = await advRes.json() as { code?: string; message?: string };
      res.status(advRes.status).json(e);
      return;
    }
    const advisoryData = await advRes.json() as { decision: string; irrigationMm: number; explanationFeatures: unknown[] };

    // 3. Get translation
    const transRes = await fetchWithTimeout(`${TRANS_URL}/translate`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: advisoryData.decision, language, soilMoisturePct, rain3dMm: weatherData.rain3dMm }),
    });
    const transData = await transRes.json() as { explanation: string };

    const result = {
      ...advisoryData,
      explanation: transData.explanation,
      weather: weatherData,
      staleWeather,
      language,
      latencyMs: Date.now() - t0,
    };

    // Queue a mock notification after the advisory is computed. A Redis outage
    // should not discard the advisory response; expose the enqueue outcome.
    let notificationQueued = false;
    try {
      const phone = (req as express.Request & { phone?: string }).phone ?? "unknown";
      const requestId = (req as express.Request & { requestId?: string }).requestId ?? uuidv4();
      await redis.xadd(
        "advisory.created", "*",
        "phone", phone,
        "decision", advisoryData.decision,
        "irrigationMm", String(advisoryData.irrigationMm),
        "language", language ?? "en",
        "requestId", requestId,
      );
      notificationEnqueued.inc();
      notificationQueued = true;
    } catch (error) {
      notificationEnqueueErrors.inc();
      console.error("Could not enqueue advisory notification:", error);
    }

    requestsTotal.inc({ method: "POST", route: "/api/advisory", status: "200" });
    res.json({ ...result, notificationQueued });
  } catch (err: unknown) {
    const e = err as { status?: number; code?: string; message?: string };
    requestsTotal.inc({ method: "POST", route: "/api/advisory", status: String(e.status ?? 500) });
    res.status(e.status ?? 500).json({ code: e.code ?? "SERVER_ERROR", message: e.message ?? "Server error" });
  }
});

// Inventory itself currently lives in browser localStorage. Accept bounded
// action/category labels so those real UI changes can still be observed without
// exporting item names, quantities, or user data as Prometheus labels.
app.post("/api/metrics/inventory", (req, res) => {
  const actions = ["add", "edit", "delete"] as const;
  const categories = ["Fertilizer", "Machinery", "Seeds", "Pesticides", "Fuel"] as const;
  const { action, category } = req.body ?? {};
  const source = req.body?.source ?? "site";
  if (!actions.includes(action) || !categories.includes(category) || !["site", "demo"].includes(source)) {
    res.status(400).json({ code: "INVALID_INVENTORY_EVENT", message: "A valid inventory action and category are required" });
    return;
  }
  inventoryActions.inc({ action, category, source });
  requestsTotal.inc({ method: "POST", route: "/api/metrics/inventory", status: "204" });
  res.status(204).end();
});

// Generate agriculture-focused briefs through Gemini on the server. The API key
// stays in the gateway environment and is never sent to the browser.
app.get("/api/news", async (req, res) => {
  const startedAt = Date.now();
  const topic = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 160) : "";
  if (typeof req.query.q === "string" && req.query.q.length > 160) {
    res.status(400).json({ code: "TOPIC_TOO_LONG", message: "News topic must be 160 characters or fewer" });
    return;
  }
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    newsGenerationRequests.inc({ result: "error" });
    requestsTotal.inc({ method: "GET", route: "/api/news", status: "503" });
    res.status(503).json({ code: "GEMINI_NOT_CONFIGURED", message: "News generation is not configured on the server" });
    return;
  }

  try {
    const prompt = [
      "Write four original, practical agriculture news and advisory briefs for sugarcane growers in India.",
      topic ? `Focus the briefs on this user-requested topic: ${JSON.stringify(topic)}.` : "Cover timely, generally useful topics such as crop care, irrigation, soil, pests, harvesting, or farm technology.",
      "Do not claim these are verified breaking news or invent named people, government announcements, dates, statistics, or specific events. Make them clearly educational and actionable.",
      "Return only a JSON array of exactly four objects with string fields title, excerpt, body, and author. Keep each excerpt to one sentence and each body to two or three short paragraphs. Set author to Gemini Agriculture Desk.",
    ].join(" ");
    let geminiResponse: Response | undefined;
    for (let attempt = 0; attempt < 2; attempt++) {
      geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.7 },
        }),
        signal: AbortSignal.timeout(30000),
      });
      const temporaryFailure = geminiResponse.status === 429 || geminiResponse.status >= 500;
      if (geminiResponse.ok || !temporaryFailure || attempt === 1) break;
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }
    if (!geminiResponse || !geminiResponse.ok) {
      // Do not forward provider response bodies: they can contain sensitive request details.
      throw new Error(`Gemini returned HTTP ${geminiResponse?.status ?? "no response"}`);
    }
    const payload = await geminiResponse.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const generatedText = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();
    if (!generatedText) throw new Error("Gemini returned no article text");
    const parsed = JSON.parse(generatedText.replace(/^```(?:json)?\s*|\s*```$/g, ""));
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Gemini returned an invalid article list");
    const articles = parsed.slice(0, 4).map((article: Record<string, unknown>, index: number) => {
      if (typeof article.title !== "string" || typeof article.body !== "string") throw new Error("Gemini returned an incomplete article");
      return {
        id: `gemini-${Date.now()}-${index}`,
        title: article.title.slice(0, 180),
        excerpt: (typeof article.excerpt === "string" ? article.excerpt : article.body).slice(0, 320),
        body: article.body.slice(0, 8000),
        author: typeof article.author === "string" ? article.author.slice(0, 80) : "Gemini Agriculture Desk",
        date: new Date().toISOString(),
      };
    });
    newsGenerationRequests.inc({ result: "success" });
    newsArticlesGenerated.inc(articles.length);
    requestsTotal.inc({ method: "GET", route: "/api/news", status: "200" });
    res.json({ articles, generatedBy: "Gemini", generatedAt: new Date().toISOString() });
  } catch (error) {
    newsGenerationRequests.inc({ result: "error" });
    requestsTotal.inc({ method: "GET", route: "/api/news", status: "502" });
    console.error("News generation failed:", error instanceof Error ? error.message : "unknown error");
    res.status(502).json({ code: "NEWS_GENERATION_FAILED", message: "Gemini could not generate news right now. Please try again." });
  } finally {
    newsGenerationDuration.observe((Date.now() - startedAt) / 1000);
  }
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "gateway" }));
app.get("/metrics", async (_req, res) => { res.set("Content-Type", promRegister.contentType); res.end(await promRegister.metrics()); });
app.use((_req, res) => res.status(404).json({ code: "NOT_FOUND", message: "Route not found" }));

const server = app.listen(PORT, () => console.log(`Gateway running on port ${PORT}`));
const shutdown = () => server.close(() => { redis.disconnect(); process.exit(0); });
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
