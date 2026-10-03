import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wifi, WifiOff, Battery, BatteryWarning, BatteryFull,
  AlertTriangle, CheckCircle2, XCircle, Bell,
  Thermometer, Droplets, Wind, Gauge, Zap, Waves,
  Activity, Clock, MapPin,
  Signal, Radio, Server, Cpu, LayoutGrid,
  List, Eye,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GaugeChart } from "@/components/charts/GaugeChart";
import { LineChart } from "@/components/charts/LineChart";

/* ── Sensor Types & Config ── */
interface SensorReading {
  timestamp: string;
  value: number;
}

interface Sensor {
  id: string;
  name: string;
  type: "soil_moisture" | "temperature" | "humidity" | "ph" | "ec" | "water_flow" | "light" | "wind_speed";
  location: string;
  plotId: string;
  unit: string;
  currentValue: number;
  min: number;
  max: number;
  thresholds: { low: number; high: number };
  status: "online" | "offline" | "warning";
  battery: number;
  protocol: "LoRa" | "WiFi" | "Zigbee" | "NB-IoT";
  lastCalibration: string;
  firmware: string;
  history: SensorReading[];
}

const SENSOR_ICONS: Record<string, any> = {
  soil_moisture: Droplets,
  temperature: Thermometer,
  humidity: Wind,
  ph: Gauge,
  ec: Zap,
  water_flow: Waves,
  light: Activity,
  wind_speed: Wind,
};

const SENSOR_COLORS: Record<string, string> = {
  soil_moisture: "#06b6d4",
  temperature: "#ef4444",
  humidity: "#8b5cf6",
  ph: "#f59e0b",
  ec: "#22c55e",
  water_flow: "#3b82f6",
  light: "#fbbf24",
  wind_speed: "#6366f1",
};

function generateHistory(baseValue: number, variance: number, count: number): SensorReading[] {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => ({
    timestamp: new Date(now - (count - i) * 3600000).toISOString(),
    value: Math.max(0, baseValue + (Math.random() - 0.5) * variance * 2),
  }));
}

function createInitialSensors(): Sensor[] {
  return [
    {
      id: "SM-001", name: "Soil Moisture Sensor", type: "soil_moisture",
      location: "Plot A - North", plotId: "A", unit: "%", currentValue: 45.2,
      min: 0, max: 100, thresholds: { low: 30, high: 80 },
      status: "online", battery: 87, protocol: "LoRa", lastCalibration: "2026-07-15", firmware: "v2.4.1",
      history: generateHistory(45, 12, 24),
    },
    {
      id: "SM-002", name: "Soil Moisture Sensor", type: "soil_moisture",
      location: "Plot B - Center", plotId: "B", unit: "%", currentValue: 22.8,
      min: 0, max: 100, thresholds: { low: 30, high: 80 },
      status: "warning", battery: 34, protocol: "LoRa", lastCalibration: "2026-06-20", firmware: "v2.4.1",
      history: generateHistory(25, 8, 24),
    },
    {
      id: "TMP-001", name: "Air Temperature", type: "temperature",
      location: "Plot A - Weather Station", plotId: "A", unit: "°C", currentValue: 32.4,
      min: -10, max: 50, thresholds: { low: 10, high: 42 },
      status: "online", battery: 92, protocol: "WiFi", lastCalibration: "2026-07-01", firmware: "v3.1.0",
      history: generateHistory(31, 5, 24),
    },
    {
      id: "TMP-002", name: "Soil Temperature", type: "temperature",
      location: "Plot C - Root Zone", plotId: "C", unit: "°C", currentValue: 28.1,
      min: -10, max: 50, thresholds: { low: 15, high: 38 },
      status: "online", battery: 78, protocol: "LoRa", lastCalibration: "2026-07-10", firmware: "v2.3.5",
      history: generateHistory(27, 3, 24),
    },
    {
      id: "HUM-001", name: "Relative Humidity", type: "humidity",
      location: "Plot A - Weather Station", plotId: "A", unit: "%", currentValue: 68.5,
      min: 0, max: 100, thresholds: { low: 30, high: 90 },
      status: "online", battery: 91, protocol: "WiFi", lastCalibration: "2026-07-01", firmware: "v3.1.0",
      history: generateHistory(65, 15, 24),
    },
    {
      id: "PH-001", name: "Soil pH Sensor", type: "ph",
      location: "Plot A - South", plotId: "A", unit: "pH", currentValue: 6.8,
      min: 0, max: 14, thresholds: { low: 5.5, high: 8.5 },
      status: "online", battery: 65, protocol: "Zigbee", lastCalibration: "2026-06-15", firmware: "v1.8.2",
      history: generateHistory(6.7, 0.5, 24),
    },
    {
      id: "EC-001", name: "Electrical Conductivity", type: "ec",
      location: "Plot B - Irrigation Line", plotId: "B", unit: "dS/m", currentValue: 1.8,
      min: 0, max: 5, thresholds: { low: 0.5, high: 3.0 },
      status: "online", battery: 72, protocol: "Zigbee", lastCalibration: "2026-06-25", firmware: "v1.8.2",
      history: generateHistory(1.7, 0.4, 24),
    },
    {
      id: "WF-001", name: "Water Flow Meter", type: "water_flow",
      location: "Main Pipeline - Inlet", plotId: "Main", unit: "L/hr", currentValue: 1250,
      min: 0, max: 5000, thresholds: { low: 100, high: 4000 },
      status: "online", battery: 100, protocol: "NB-IoT", lastCalibration: "2026-07-20", firmware: "v4.0.3",
      history: generateHistory(1200, 300, 24),
    },
    {
      id: "WF-002", name: "Drip Flow Rate", type: "water_flow",
      location: "Plot A - Drip Zone", plotId: "A", unit: "L/hr", currentValue: 420,
      min: 0, max: 2000, thresholds: { low: 50, high: 1500 },
      status: "online", battery: 88, protocol: "NB-IoT", lastCalibration: "2026-07-18", firmware: "v4.0.3",
      history: generateHistory(400, 100, 24),
    },
    {
      id: "LX-001", name: "Light Intensity", type: "light",
      location: "Plot C - Open Field", plotId: "C", unit: "lux", currentValue: 45000,
      min: 0, max: 120000, thresholds: { low: 10000, high: 100000 },
      status: "online", battery: 95, protocol: "WiFi", lastCalibration: "2026-07-05", firmware: "v2.1.0",
      history: generateHistory(40000, 20000, 24),
    },
    {
      id: "WS-001", name: "Wind Speed", type: "wind_speed",
      location: "Weather Station", plotId: "Main", unit: "km/h", currentValue: 12.3,
      min: 0, max: 100, thresholds: { low: 0, high: 50 },
      status: "online", battery: 81, protocol: "WiFi", lastCalibration: "2026-07-01", firmware: "v3.1.0",
      history: generateHistory(14, 8, 24),
    },
    {
      id: "SM-003", name: "Deep Soil Moisture", type: "soil_moisture",
      location: "Plot C - 30cm depth", plotId: "C", unit: "%", currentValue: 58.1,
      min: 0, max: 100, thresholds: { low: 30, high: 80 },
      status: "offline", battery: 5, protocol: "LoRa", lastCalibration: "2026-05-10", firmware: "v2.3.0",
      history: generateHistory(55, 10, 24),
    },
  ];
}

/* ── Alert Types ── */
interface Alert {
  id: string;
  sensorId: string;
  sensorName: string;
  location: string;
  type: "critical" | "warning" | "info";
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

function generateAlerts(sensors: Sensor[]): Alert[] {
  const alerts: Alert[] = [];
  sensors.forEach((s) => {
    if (s.status === "offline") {
      alerts.push({
        id: `alert-${s.id}-offline`,
        sensorId: s.id, sensorName: s.name, location: s.location,
        type: "critical",
        message: `${s.name} (${s.id}) is OFFLINE. Battery: ${s.battery}%. Check device.`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }
    if (s.currentValue < s.thresholds.low && s.status !== "offline") {
      alerts.push({
        id: `alert-${s.id}-low`,
        sensorId: s.id, sensorName: s.name, location: s.location,
        type: "critical",
        message: `${s.name} at ${s.location} reading critically low: ${s.currentValue.toFixed(1)}${s.unit} (threshold: ${s.thresholds.low}${s.unit})`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }
    if (s.currentValue > s.thresholds.high && s.status !== "offline") {
      alerts.push({
        id: `alert-${s.id}-high`,
        sensorId: s.id, sensorName: s.name, location: s.location,
        type: "warning",
        message: `${s.name} at ${s.location} reading high: ${s.currentValue.toFixed(1)}${s.unit} (threshold: ${s.thresholds.high}${s.unit})`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }
    if (s.battery < 20 && s.battery > 0) {
      alerts.push({
        id: `alert-${s.id}-battery`,
        sensorId: s.id, sensorName: s.name, location: s.location,
        type: "warning",
        message: `Low battery on ${s.id}: ${s.battery}%. Replace soon.`,
        timestamp: new Date().toISOString(),
        acknowledged: false,
      });
    }
  });
  return alerts;
}

export default function IoT() {
  const [sensors, setSensors] = useState<Sensor[]>(createInitialSensors);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterPlot, setFilterPlot] = useState("All");
  const [showAlerts, setShowAlerts] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Generate alerts from sensor state
  useEffect(() => {
    setAlerts(generateAlerts(sensors));
  }, [sensors]);

  // Simulate real-time updates every 5 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSensors((prev) =>
        prev.map((s) => {
          if (s.status === "offline") return s;
          const variance = s.type === "water_flow" ? 50 : s.type === "light" ? 5000 : s.type === "ec" ? 0.1 : s.type === "ph" ? 0.05 : 1.5;
          const newValue = Math.max(s.min, Math.min(s.max, s.currentValue + (Math.random() - 0.5) * variance));
          const newHistory = [...s.history.slice(1), { timestamp: new Date().toISOString(), value: newValue }];
          return { ...s, currentValue: newValue, history: newHistory };
        })
      );
    }, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const plots = ["All", ...new Set(sensors.map((s) => s.plotId))];
  const filteredSensors = filterPlot === "All" ? sensors : sensors.filter((s) => s.plotId === filterPlot);

  const onlineCount = sensors.filter((s) => s.status === "online").length;
  const warningCount = sensors.filter((s) => s.status === "warning").length;
  const offlineCount = sensors.filter((s) => s.status === "offline").length;
  const criticalAlerts = alerts.filter((a) => a.type === "critical" && !a.acknowledged);

  const acknowledgeAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, acknowledged: true } : a));
  };

  return (
    <div className="page-container bg-neutral-50 dark:bg-neutral-950 min-h-screen transition-colors duration-300">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-[#f5f5dc]/40 dark:bg-neutral-900 py-16 px-4">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[100px]" />
          </div>
          <div className="relative max-w-[1200px] mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-black/5 dark:bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center border border-neutral-200 dark:border-white/10">
                  <Cpu size={24} className="text-neutral-900 dark:text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
                  IoT Monitoring
                </h1>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg max-w-2xl">
                Real-time sensor network monitoring — soil moisture, temperature, pH, water flow, and environmental data across all plots.
              </p>
            </motion.div>
          </div>
        </section>

        <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-6">
          {/* Network Status Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { icon: Server, label: "Total Sensors", value: sensors.length.toString(), gradient: "from-neutral-600 to-neutral-700" },
              { icon: Wifi, label: "Online", value: onlineCount.toString(), gradient: "from-green-500 to-emerald-600" },
              { icon: AlertTriangle, label: "Warning", value: warningCount.toString(), gradient: "from-amber-500 to-orange-600" },
              { icon: WifiOff, label: "Offline", value: offlineCount.toString(), gradient: "from-red-500 to-red-600" },
              { icon: Bell, label: "Active Alerts", value: criticalAlerts.length.toString(), gradient: "from-red-600 to-pink-600" },
            ].map((card, i) => (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-100 dark:border-neutral-800 shadow-md p-4 flex items-center gap-3"
              >
                <div className={`w-10 h-10 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                  <card.icon size={18} className="text-neutral-900 dark:text-white" />
                </div>
                <div>
                  <p className="text-xl font-black text-neutral-900 dark:text-white">{card.value}</p>
                  <p className="text-[10px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase">{card.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Critical Alerts Banner */}
          <AnimatePresence>
            {showAlerts && criticalAlerts.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-2xl overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-red-800 dark:text-red-300 flex items-center gap-2">
                      <AlertTriangle size={16} /> Active Alerts ({criticalAlerts.length})
                    </h3>
                    <button onClick={() => setShowAlerts(false)} className="text-xs text-red-500 hover:text-red-700">
                      Dismiss
                    </button>
                  </div>
                  <div className="space-y-2">
                    {criticalAlerts.slice(0, 5).map((alert) => (
                      <div key={alert.id} className="flex items-start justify-between gap-3 p-3 bg-white dark:bg-neutral-900 rounded-xl border border-red-100 dark:border-red-900/20">
                        <div className="flex items-start gap-2">
                          <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm text-neutral-800 dark:text-neutral-200">{alert.message}</p>
                            <p className="text-[10px] text-neutral-400 mt-1">{alert.location} • {new Date(alert.timestamp).toLocaleTimeString("en-IN")}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="px-2 py-1 text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors flex-shrink-0"
                        >
                          ACK
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Plot Filter */}
            <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-1">
              {plots.map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPlot(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    filterPlot === p
                      ? "bg-green-600 text-white shadow-sm"
                      : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  }`}
                >
                  {p === "All" ? "All Plots" : `Plot ${p}`}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl p-1 ml-auto">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-green-600 text-white" : "text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"}`}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${viewMode === "list" ? "bg-green-600 text-white" : "text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"}`}
              >
                <List size={14} />
              </button>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              LIVE — Updates every 5s
            </div>
          </div>

          {/* Sensor Gauge Overview */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-lg p-6"
          >
            <h2 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-6">
              Key Metrics — Real-Time Gauges
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {sensors.filter((s) => s.status !== "offline").slice(0, 6).map((sensor) => (
                <GaugeChart
                  key={sensor.id}
                  value={sensor.currentValue}
                  min={sensor.min}
                  max={sensor.max}
                  label={`${sensor.id}`}
                  unit={sensor.unit}
                  thresholds={sensor.thresholds}
                  size={120}
                />
              ))}
            </div>
          </motion.section>

          {/* Sensor Cards */}
          <div className={viewMode === "grid" ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
            {filteredSensors.map((sensor, i) => {
              const Icon = SENSOR_ICONS[sensor.type] || Activity;
              const color = SENSOR_COLORS[sensor.type] || "#22c55e";
              const isSelected = selectedSensor?.id === sensor.id;
              const sparkData = sensor.history.slice(-12).map((h, j) => ({
                label: j.toString(),
                value: h.value,
              }));

              return (
                <motion.div
                  key={sensor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedSensor(isSelected ? null : sensor)}
                  className={`bg-white dark:bg-neutral-900 rounded-2xl border shadow-md cursor-pointer transition-all hover:shadow-lg ${
                    isSelected
                      ? "border-green-300 dark:border-green-700 ring-2 ring-green-400/50"
                      : "border-neutral-100 dark:border-neutral-800"
                  } ${viewMode === "list" ? "flex items-center gap-4 p-4" : "p-5"}`}
                >
                  {/* Header */}
                  <div className={`flex items-start justify-between ${viewMode === "list" ? "flex-1 min-w-0" : "mb-4"}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}20` }}>
                        <Icon size={18} style={{ color }} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white truncate">{sensor.name}</h3>
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                          <MapPin size={8} /> {sensor.location}
                        </p>
                      </div>
                    </div>
                    {/* Status badge */}
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0 ${
                      sensor.status === "online" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                      sensor.status === "warning" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>
                      {sensor.status === "online" ? <Wifi size={8} /> : sensor.status === "warning" ? <AlertTriangle size={8} /> : <WifiOff size={8} />}
                      {sensor.status.toUpperCase()}
                    </div>
                  </div>

                  {viewMode === "grid" && (
                    <>
                      {/* Reading */}
                      <div className="flex items-end gap-1 mb-3">
                        <span className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                          {sensor.currentValue.toFixed(sensor.type === "ph" || sensor.type === "ec" ? 2 : 1)}
                        </span>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">{sensor.unit}</span>
                      </div>

                      {/* Sparkline */}
                      <div className="h-12 mb-3">
                        <svg viewBox="0 0 200 50" className="w-full h-full" preserveAspectRatio="none">
                          <path
                            d={sparkData.map((p, j) => {
                              const x = (j / (sparkData.length - 1)) * 200;
                              const range = sensor.max - sensor.min || 1;
                              const y = 45 - ((p.value - sensor.min) / range) * 40;
                              return `${j === 0 ? "M" : "L"} ${x} ${y}`;
                            }).join(" ")}
                            fill="none"
                            stroke={color}
                            strokeWidth={2}
                            strokeLinecap="round"
                          />
                          <path
                            d={sparkData.map((p, j) => {
                              const x = (j / (sparkData.length - 1)) * 200;
                              const range = sensor.max - sensor.min || 1;
                              const y = 45 - ((p.value - sensor.min) / range) * 40;
                              return `${j === 0 ? "M" : "L"} ${x} ${y}`;
                            }).join(" ") + ` L 200 50 L 0 50 Z`}
                            fill={`${color}15`}
                          />
                        </svg>
                      </div>

                      {/* Meta row */}
                      <div className="flex items-center justify-between text-[10px] text-neutral-400 dark:text-neutral-500 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                        <div className="flex items-center gap-1">
                          {sensor.battery > 60 ? <BatteryFull size={10} className="text-green-500" /> :
                           sensor.battery > 20 ? <Battery size={10} className="text-amber-500" /> :
                           <BatteryWarning size={10} className="text-red-500" />}
                          {sensor.battery}%
                        </div>
                        <div className="flex items-center gap-1">
                          <Radio size={10} /> {sensor.protocol}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={10} /> {sensor.id}
                        </div>
                      </div>
                    </>
                  )}

                  {viewMode === "list" && (
                    <div className="flex items-center gap-6 flex-shrink-0">
                      <div className="text-right">
                        <p className="text-lg font-black text-neutral-900 dark:text-white">
                          {sensor.currentValue.toFixed(sensor.type === "ph" || sensor.type === "ec" ? 2 : 1)}{sensor.unit}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                        {sensor.battery > 60 ? <BatteryFull size={10} className="text-green-500" /> : <BatteryWarning size={10} className="text-red-500" />}
                        {sensor.battery}%
                      </div>
                      <div className="text-[10px] text-neutral-400">{sensor.protocol}</div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Selected Sensor Detail Panel */}
          <AnimatePresence>
            {selectedSensor && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-neutral-900 rounded-2xl border border-green-200 dark:border-green-800 shadow-xl p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Eye size={18} className="text-green-500" />
                    {selectedSensor.name} — {selectedSensor.id}
                  </h2>
                  <button onClick={() => setSelectedSensor(null)} className="text-neutral-400 hover:text-neutral-600 p-1">
                    ✕
                  </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* 24h History Chart */}
                  <LineChart
                    data={selectedSensor.history.map((h) => ({
                      label: new Date(h.timestamp).toLocaleTimeString("en-IN", { hour: "2-digit" }),
                      value: h.value,
                    }))}
                    title={`24-Hour History (${selectedSensor.unit})`}
                    height={200}
                    lineColor={SENSOR_COLORS[selectedSensor.type]}
                  />

                  {/* Device Details */}
                  <div>
                    <h3 className="text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-3">Device Information</h3>
                    <div className="space-y-2">
                      {[
                        { label: "Sensor ID", value: selectedSensor.id },
                        { label: "Type", value: selectedSensor.type.replace("_", " ").toUpperCase() },
                        { label: "Location", value: selectedSensor.location },
                        { label: "Plot", value: `Plot ${selectedSensor.plotId}` },
                        { label: "Protocol", value: selectedSensor.protocol },
                        { label: "Firmware", value: selectedSensor.firmware },
                        { label: "Battery", value: `${selectedSensor.battery}%` },
                        { label: "Last Calibration", value: selectedSensor.lastCalibration },
                        { label: "Low Threshold", value: `${selectedSensor.thresholds.low} ${selectedSensor.unit}` },
                        { label: "High Threshold", value: `${selectedSensor.thresholds.high} ${selectedSensor.unit}` },
                        { label: "Range", value: `${selectedSensor.min} — ${selectedSensor.max} ${selectedSensor.unit}` },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-neutral-100 dark:border-neutral-800">
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">{row.label}</span>
                          <span className="text-xs font-semibold text-neutral-800 dark:text-white">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Sensor Map / Topology */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-lg p-6"
          >
            <h2 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
              Network Topology — Sensor Placement
            </h2>
            <div className="grid grid-cols-4 gap-3">
              {["A", "B", "C", "Main"].map((plot) => {
                const plotSensors = sensors.filter((s) => s.plotId === plot);
                return (
                  <div key={plot} className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-4 border border-neutral-100 dark:border-neutral-700">
                    <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-3">
                      {plot === "Main" ? "🏭 Main Hub" : `🌾 Plot ${plot}`}
                    </h4>
                    <div className="space-y-2">
                      {plotSensors.map((s) => {
                        const Icon = SENSOR_ICONS[s.type] || Activity;
                        return (
                          <div key={s.id} className="flex items-center gap-2 text-[10px]">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              s.status === "online" ? "bg-green-500" : s.status === "warning" ? "bg-amber-500" : "bg-red-500"
                            }`} />
                            <Icon size={10} className="text-neutral-400" />
                            <span className="text-neutral-600 dark:text-neutral-400 truncate">{s.id}</span>
                            <span className="ml-auto font-semibold text-neutral-800 dark:text-white">
                              {s.currentValue.toFixed(s.type === "ph" ? 1 : 0)}{s.unit}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 pt-2 border-t border-neutral-200 dark:border-neutral-600">
                      <p className="text-[10px] text-neutral-400">{plotSensors.length} sensors • {plotSensors.filter((s) => s.status === "online").length} online</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.section>

          {/* All Alerts Log */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-lg p-6"
          >
            <h2 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
              Alert History
            </h2>
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle2 size={32} className="mx-auto mb-2 text-green-400" />
                <p className="text-sm text-neutral-500">All systems normal. No alerts.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border ${
                      alert.acknowledged ? "opacity-50" : ""
                    } ${
                      alert.type === "critical" ? "bg-red-50 dark:bg-red-950/10 border-red-100 dark:border-red-900/20" :
                      alert.type === "warning" ? "bg-amber-50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/20" :
                      "bg-blue-50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/20"
                    }`}
                  >
                    {alert.type === "critical" ? <XCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" /> :
                     alert.type === "warning" ? <AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" /> :
                     <Bell size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-neutral-700 dark:text-neutral-300">{alert.message}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{new Date(alert.timestamp).toLocaleString("en-IN")}</p>
                    </div>
                    {!alert.acknowledged && (
                      <button onClick={() => acknowledgeAlert(alert.id)} className="text-[10px] font-bold text-neutral-500 hover:text-neutral-700 flex-shrink-0">
                        ACK
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.section>

          {/* Protocol & Specs Reference */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-lg p-6"
          >
            <h2 className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-4">
              Communication Protocols
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { name: "LoRa", range: "2–15 km", power: "Ultra-low", dataRate: "0.3–50 kbps", count: sensors.filter((s) => s.protocol === "LoRa").length, color: "from-green-500 to-emerald-600" },
                { name: "WiFi", range: "50–100 m", power: "Moderate", dataRate: "1–100 Mbps", count: sensors.filter((s) => s.protocol === "WiFi").length, color: "from-blue-500 to-indigo-600" },
                { name: "Zigbee", range: "10–100 m", power: "Low", dataRate: "250 kbps", count: sensors.filter((s) => s.protocol === "Zigbee").length, color: "from-purple-500 to-violet-600" },
                { name: "NB-IoT", range: "Cellular", power: "Low", dataRate: "~250 kbps", count: sensors.filter((s) => s.protocol === "NB-IoT").length, color: "from-cyan-500 to-teal-600" },
              ].map((proto) => (
                <div key={proto.name} className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-4 border border-neutral-100 dark:border-neutral-700">
                  <div className={`w-8 h-8 bg-gradient-to-br ${proto.color} rounded-lg flex items-center justify-center mb-2 shadow`}>
                    <Signal size={14} className="text-neutral-900 dark:text-white" />
                  </div>
                  <h4 className="font-bold text-neutral-900 dark:text-white text-sm">{proto.name}</h4>
                  <div className="mt-2 space-y-1 text-[10px] text-neutral-500 dark:text-neutral-400">
                    <p>Range: {proto.range}</p>
                    <p>Power: {proto.power}</p>
                    <p>Data Rate: {proto.dataRate}</p>
                    <p className="font-semibold text-neutral-700 dark:text-neutral-300">{proto.count} sensors</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
