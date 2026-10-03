import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  CloudRain, Thermometer, Wind, Droplets, Sun, CloudSun,
  Cloud, CloudDrizzle, CloudSnow, CloudLightning, AlertTriangle,
  MapPin, RefreshCw, Gauge, Sunrise, Sunset,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LineChart } from "@/components/charts/LineChart";
import { BarChart } from "@/components/charts/BarChart";

/* ── Fix Leaflet default icon (Vite bundling issue) ── */
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

/* ── District Data (North Karnataka sugarcane belt) ── */
const DISTRICTS = [
  { name: "Belgaum (Belagavi)", lat: 15.85, lon: 74.50, avgYield: 48, area: "12,500 ha" },
  { name: "Bagalkot", lat: 16.18, lon: 75.69, avgYield: 44, area: "8,200 ha" },
  { name: "Bijapur (Vijayapura)", lat: 16.83, lon: 75.71, avgYield: 41, area: "6,800 ha" },
  { name: "Dharwad", lat: 15.46, lon: 75.01, avgYield: 43, area: "5,400 ha" },
  { name: "Haveri", lat: 14.79, lon: 75.40, avgYield: 46, area: "7,100 ha" },
  { name: "Kolhapur (MH)", lat: 16.69, lon: 74.23, avgYield: 50, area: "15,000 ha" },
  { name: "Sangli (MH)", lat: 16.85, lon: 74.57, avgYield: 47, area: "11,200 ha" },
  { name: "Raichur", lat: 16.21, lon: 77.36, avgYield: 38, area: "4,200 ha" },
  { name: "Gulbarga (Kalaburagi)", lat: 17.33, lon: 76.83, avgYield: 36, area: "3,800 ha" },
  { name: "Shimoga (Shivamogga)", lat: 13.93, lon: 75.57, avgYield: 45, area: "6,200 ha" },
];

/* ── Weather code → icon + description ── */
function getWeatherInfo(code: number) {
  if (code === 0) return { icon: Sun, desc: "Clear sky", color: "text-amber-500" };
  if (code <= 3) return { icon: CloudSun, desc: "Partly cloudy", color: "text-blue-400" };
  if (code <= 48) return { icon: Cloud, desc: "Foggy / Overcast", color: "text-neutral-400" };
  if (code <= 57) return { icon: CloudDrizzle, desc: "Drizzle", color: "text-blue-300" };
  if (code <= 67) return { icon: CloudRain, desc: "Rain", color: "text-blue-500" };
  if (code <= 77) return { icon: CloudSnow, desc: "Snow", color: "text-cyan-300" };
  if (code <= 82) return { icon: CloudRain, desc: "Rain showers", color: "text-blue-600" };
  if (code <= 86) return { icon: CloudSnow, desc: "Snow showers", color: "text-cyan-400" };
  return { icon: CloudLightning, desc: "Thunderstorm", color: "text-yellow-500" };
}

function createYieldIcon(yieldVal: number) {
  const color = yieldVal >= 45 ? "#16a34a" : yieldVal >= 40 ? "#f59e0b" : "#ef4444";
  return L.divIcon({
    className: "custom-yield-marker",
    html: `<div style="background:${color}; color:white; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; border:2px solid white; box-shadow:0 2px 8px rgba(0,0,0,0.3)">${yieldVal}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

/* ── Map center updater component ── */
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weather_code: number;
    apparent_temperature: number;
    precipitation: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    precipitation: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    wind_speed_10m_max: number[];
    sunrise: string[];
    sunset: string[];
  };
}

export default function Weather() {
  const [selectedDistrict, setSelectedDistrict] = useState(DISTRICTS[0]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature,precipitation&hourly=temperature_2m,precipitation_probability,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,sunrise,sunset&timezone=Asia/Kolkata&forecast_days=7`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch weather data");
      const data = await res.json();
      setWeather(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(selectedDistrict.lat, selectedDistrict.lon);
  }, [selectedDistrict, fetchWeather]);

  const currentWeather = weather?.current;
  const weatherInfo = currentWeather ? getWeatherInfo(currentWeather.weather_code) : null;

  // Hourly data for today (next 24 hours, sampled every 3 hours)
  const hourlyChart = weather?.hourly
    ? weather.hourly.time.slice(0, 24).filter((_, i) => i % 3 === 0).map((t, i) => ({
        label: new Date(t).toLocaleTimeString("en-IN", { hour: "2-digit", hour12: true }),
        value: weather.hourly.temperature_2m[i * 3],
      }))
    : [];

  // Daily rain chart
  const dailyRainChart = weather?.daily
    ? weather.daily.time.map((t, i) => ({
        label: new Date(t).toLocaleDateString("en-IN", { weekday: "short" }),
        value: weather.daily.precipitation_sum[i],
      }))
    : [];

  // Agricultural advisories
  const advisories = [];
  if (weather?.daily) {
    const minTemp = Math.min(...weather.daily.temperature_2m_min);
    const maxRain = Math.max(...weather.daily.precipitation_sum);
    const maxWind = Math.max(...weather.daily.wind_speed_10m_max);
    const totalRain = weather.daily.precipitation_sum.reduce((s, v) => s + v, 0);

    if (minTemp < 10) advisories.push({ type: "warning", icon: Thermometer, text: `Cold stress alert: Min temp ${minTemp.toFixed(1)}°C expected. Protect young cane.` });
    if (maxRain > 50) advisories.push({ type: "danger", icon: CloudRain, text: `Waterlogging risk: Heavy rain ${maxRain.toFixed(0)}mm/day forecast. Ensure drainage.` });
    if (maxWind > 40) advisories.push({ type: "warning", icon: Wind, text: `Strong winds up to ${maxWind.toFixed(0)} km/h. Lodging risk for tall cane.` });
    if (totalRain < 5) advisories.push({ type: "info", icon: Droplets, text: `Dry spell ahead (${totalRain.toFixed(1)}mm total). Schedule irrigation.` });
    if (totalRain >= 5 && totalRain < 20) advisories.push({ type: "success", icon: CloudRain, text: `Moderate rain expected (${totalRain.toFixed(1)}mm). Can skip one irrigation cycle.` });
  }

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
          <div className="relative max-w-[1200px] mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-black/5 dark:bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center border border-neutral-200 dark:border-white/10">
                  <CloudRain size={24} className="text-neutral-900 dark:text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                  Weather Analysis
                </h1>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-2xl">
                Real-time weather data and agricultural advisories for the North Karnataka sugarcane belt.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-6">
          {/* District Selector */}
          <div className="flex items-center gap-3 flex-wrap">
            <MapPin size={18} className="text-green-600 dark:text-green-400" />
            <select
              value={selectedDistrict.name}
              onChange={(e) => {
                const d = DISTRICTS.find((d) => d.name === e.target.value) || DISTRICTS[0];
                setSelectedDistrict(d);
              }}
              className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-4 py-2.5 text-sm font-medium text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-400 cursor-pointer"
            >
              {DISTRICTS.map((d) => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
            <button
              onClick={() => fetchWeather(selectedDistrict.lat, selectedDistrict.lon)}
              className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              <RefreshCw size={16} className={`text-neutral-500 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl p-4 flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          {/* Current + Map Grid */}
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Current Weather Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-lg p-6"
            >
              <h2 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">Current Weather</h2>
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <RefreshCw size={24} className="animate-spin text-neutral-300" />
                </div>
              ) : currentWeather && weatherInfo ? (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <weatherInfo.icon size={56} className={weatherInfo.color} />
                    <div>
                      <p className="text-4xl font-black text-neutral-900 dark:text-white">
                        {currentWeather.temperature_2m.toFixed(1)}°C
                      </p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{weatherInfo.desc}</p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">Feels like {currentWeather.apparent_temperature.toFixed(1)}°C</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Droplets, label: "Humidity", value: `${currentWeather.relative_humidity_2m}%` },
                      { icon: Wind, label: "Wind", value: `${currentWeather.wind_speed_10m} km/h` },
                      { icon: CloudRain, label: "Precipitation", value: `${currentWeather.precipitation} mm` },
                      { icon: Gauge, label: "Location", value: `${selectedDistrict.lat.toFixed(2)}°N` },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50">
                        <item.icon size={14} className="text-neutral-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.label}</p>
                          <p className="text-sm font-semibold text-neutral-800 dark:text-white">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Sunrise/Sunset */}
                  {weather?.daily && (
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                        <Sunrise size={14} className="text-amber-500" />
                        {new Date(weather.daily.sunrise[0]).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                        <Sunset size={14} className="text-orange-500" />
                        {new Date(weather.daily.sunset[0]).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </motion.div>

            {/* Interactive Map */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-3 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-lg overflow-hidden"
            >
              <div className="p-4 pb-2">
                <h2 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  District Map — Sugarcane Yield (t/acre)
                </h2>
              </div>
              <div className="h-[350px] rounded-b-2xl overflow-hidden">
                <MapContainer
                  center={[selectedDistrict.lat, selectedDistrict.lon]}
                  zoom={7}
                  className="h-full w-full"
                  scrollWheelZoom={false}
                  zoomControl={true}
                >
                  <MapUpdater center={[selectedDistrict.lat, selectedDistrict.lon]} />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {DISTRICTS.map((d) => (
                    <Marker
                      key={d.name}
                      position={[d.lat, d.lon]}
                      icon={createYieldIcon(d.avgYield)}
                    >
                      <Popup>
                        <div className="text-xs">
                          <p className="font-bold text-sm mb-1">{d.name}</p>
                          <p>Avg Yield: <strong>{d.avgYield} t/acre</strong></p>
                          <p>Cane Area: {d.area}</p>
                          <p className="text-neutral-500">{d.lat.toFixed(2)}°N, {d.lon.toFixed(2)}°E</p>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </motion.div>
          </div>

          {/* 7-Day Forecast */}
          {weather?.daily && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-lg p-6"
            >
              <h2 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">7-Day Forecast</h2>
              <div className="grid grid-cols-7 gap-2">
                {weather.daily.time.map((t, i) => {
                  const info = getWeatherInfo(weather.daily.weather_code[i]);
                  const isToday = i === 0;
                  return (
                    <motion.div
                      key={t}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className={`text-center p-3 rounded-xl border transition-all ${
                        isToday
                          ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                          : "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-100 dark:border-neutral-700"
                      }`}
                    >
                      <p className={`text-xs font-bold mb-2 ${isToday ? "text-green-600 dark:text-green-400" : "text-neutral-500 dark:text-neutral-400"}`}>
                        {isToday ? "Today" : new Date(t).toLocaleDateString("en-IN", { weekday: "short" })}
                      </p>
                      <info.icon size={24} className={`mx-auto mb-2 ${info.color}`} />
                      <p className="text-sm font-bold text-neutral-900 dark:text-white">
                        {weather.daily.temperature_2m_max[i].toFixed(0)}°
                      </p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        {weather.daily.temperature_2m_min[i].toFixed(0)}°
                      </p>
                      <div className="mt-2 flex items-center justify-center gap-1 text-blue-500">
                        <Droplets size={10} />
                        <span className="text-[10px] font-semibold">{weather.daily.precipitation_sum[i].toFixed(1)}mm</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          )}

          {/* Agricultural Advisories */}
          {advisories.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-lg p-6"
            >
              <h2 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
                🌾 Agricultural Advisories
              </h2>
              <div className="space-y-3">
                {advisories.map((adv, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${
                      adv.type === "danger" ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30" :
                      adv.type === "warning" ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30" :
                      adv.type === "success" ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30" :
                      "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30"
                    }`}
                  >
                    <adv.icon size={18} className={`flex-shrink-0 mt-0.5 ${
                      adv.type === "danger" ? "text-red-500" :
                      adv.type === "warning" ? "text-amber-500" :
                      adv.type === "success" ? "text-green-500" :
                      "text-blue-500"
                    }`} />
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">{adv.text}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6">
            {hourlyChart.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-lg p-6"
              >
                <LineChart data={hourlyChart} title="Today's Temperature (°C)" height={200} unit="°" lineColor="#ef4444" />
              </motion.div>
            )}
            {dailyRainChart.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-lg p-6"
              >
                <BarChart data={dailyRainChart} title="7-Day Rainfall Forecast (mm)" height={200} barColor="#3b82f6" />
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
