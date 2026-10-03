import { Counter } from 'prom-client';

const staleWeatherTotal = new Counter({
  name: 'stale_weather_responses_total',
  help: 'Advisory responses that used stale cached weather',
});

interface WeatherData { rain3dMm: number; tempMaxC: number; et0Mm: number; }

// Fallback village coords for Northern Karnataka demo reliability
const VILLAGE_COORDS: Record<string, [number, number]> = {
  athani: [16.7298, 75.0667], bagalkot: [16.1833, 75.7000],
  bijapur: [16.8302, 75.7100], dharwad: [15.4589, 75.0078],
  gadag: [15.4167, 75.6167], haveri: [14.7942, 75.4008],
  hospet: [15.2689, 76.3909], hubli: [15.3647, 75.1240],
  bidar: [17.9104, 77.5199], gulbarga: [17.3297, 76.8343],
  raichur: [16.2120, 77.3439], koppal: [15.3508, 76.1550],
};

const DEFAULT_COORD: [number, number] = [16.0, 75.5]; // Central N Karnataka

interface CacheEntry { data: WeatherData; ts: number; }
const cache = new Map<string, CacheEntry>();
const TTL_MS = parseInt(process.env.WEATHER_CACHE_TTL_MS ?? '600000', 10);

async function geocodeVillage(village: string): Promise<[number, number]> {
  const key = village.toLowerCase().replace(/[^a-z]/g, '');
  if (VILLAGE_COORDS[key]) return VILLAGE_COORDS[key];
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(village)}&count=1&language=en&format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await res.json() as { results?: Array<{ latitude: number; longitude: number }> };
    if (data.results?.[0]) return [data.results[0].latitude, data.results[0].longitude];
  } catch { /* fall through */ }
  return DEFAULT_COORD;
}

export async function getWeather(village: string): Promise<{ data: WeatherData; stale: boolean }> {
  const cacheKey = village.toLowerCase().trim();
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.ts < TTL_MS) return { data: cached.data, stale: false };

  try {
    const [lat, lon] = await geocodeVillage(village);
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_sum,temperature_2m_max,et0_fao_evapotranspiration&forecast_days=3&timezone=Asia%2FKolkata`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const raw = await res.json() as { daily?: { precipitation_sum?: number[]; temperature_2m_max?: number[]; et0_fao_evapotranspiration?: number[] } };
    const d = raw.daily;
    const rain3dMm = (d?.precipitation_sum ?? [0, 0, 0]).reduce((a: number, b: number) => a + b, 0);
    const tempMaxC = (d?.temperature_2m_max ?? [30])[0] ?? 30;
    const et0Mm = (d?.et0_fao_evapotranspiration ?? [5])[0] ?? 5;
    const data: WeatherData = { rain3dMm, tempMaxC, et0Mm };
    cache.set(cacheKey, { data, ts: Date.now() });
    return { data, stale: false };
  } catch {
    if (cached) {
      staleWeatherTotal.inc();
      return { data: cached.data, stale: true };
    }
    // Absolute fallback
    const data: WeatherData = { rain3dMm: 0, tempMaxC: 32, et0Mm: 5.5 };
    staleWeatherTotal.inc();
    return { data, stale: true };
  }
}
