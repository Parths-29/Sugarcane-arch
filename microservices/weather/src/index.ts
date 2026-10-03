import express from "express";
import cors from "cors";
import { collectDefaultMetrics, register as promRegister, Counter, Histogram } from "prom-client";

collectDefaultMetrics({ prefix: "weather_" });
const weatherFetches = new Counter({ name: "weather_fetches_total", help: "Open-Meteo fetches", labelNames: ["status"] });
const weatherDuration = new Histogram({ name: "weather_fetch_duration_seconds", help: "Time to fetch weather", buckets: [0.1, 0.5, 1, 2, 5] });

const app = express();
const PORT = parseInt(process.env.PORT ?? "8002", 10);
const TTL_MS = parseInt(process.env.WEATHER_CACHE_TTL_MS ?? "600000", 10);

app.use(cors());
app.use(express.json());

const VILLAGE_COORDS: Record<string, [number, number]> = {
  athani: [16.7298, 75.0667], bagalkot: [16.1833, 75.7000],
  bijapur: [16.8302, 75.7100], dharwad: [15.4589, 75.0078],
  gadag: [15.4167, 75.6167], haveri: [14.7942, 75.4008],
  hospet: [15.2689, 76.3909], hubli: [15.3647, 75.1240],
  bidar: [17.9104, 77.5199], gulbarga: [17.3297, 76.8343],
  raichur: [16.2120, 77.3439], koppal: [15.3508, 76.1550],
};

const cache = new Map<string, { data: { rain3dMm: number; tempMaxC: number; et0Mm: number }; ts: number }>();

async function geocode(village: string): Promise<[number, number]> {
  const key = village.toLowerCase().replace(/[^a-z]/g, "");
  if (VILLAGE_COORDS[key]) return VILLAGE_COORDS[key];
  try {
    const r = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(village)}&count=1&language=en&format=json`, { signal: AbortSignal.timeout(5000) });
    const d = await r.json() as { results?: Array<{ latitude: number; longitude: number }> };
    if (d.results?.[0]) return [d.results[0].latitude, d.results[0].longitude];
  } catch { /* fallback */ }
  return [16.0, 75.5];
}

app.get("/internal/weather", async (req, res) => {
  const village = (req.query.village as string) ?? "Athani";
  const cacheKey = village.toLowerCase().trim();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < TTL_MS) { res.json(cached.data); return; }

  const end = weatherDuration.startTimer();
  try {
    const [lat, lon] = await geocode(village);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum,temperature_2m_max,et0_fao_evapotranspiration&forecast_days=3&timezone=Asia%2FKolkata`;
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const raw = await r.json() as { daily?: { precipitation_sum?: number[]; temperature_2m_max?: number[]; et0_fao_evapotranspiration?: number[] } };
    const d = raw.daily;
    const data = {
      rain3dMm: (d?.precipitation_sum ?? [0,0,0]).reduce((a:number,b:number) => a+b, 0),
      tempMaxC: (d?.temperature_2m_max ?? [30])[0] ?? 30,
      et0Mm: (d?.et0_fao_evapotranspiration ?? [5])[0] ?? 5,
    };
    cache.set(cacheKey, { data, ts: Date.now() });
    weatherFetches.inc({ status: "success" });
    end();
    res.json(data);
  } catch (e) {
    weatherFetches.inc({ status: "error" });
    end();
    res.status(503).json({ code: "WEATHER_FETCH_ERROR", message: "Could not fetch weather" });
  }
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "weather" }));
app.get("/metrics", async (_req, res) => { res.set("Content-Type", promRegister.contentType); res.end(await promRegister.metrics()); });

const server = app.listen(PORT, () => console.log(`Weather service on ${PORT}`));
const shutdown = () => server.close(() => process.exit(0));
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
