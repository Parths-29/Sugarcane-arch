import { motion } from "framer-motion";

interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  label: string;
  unit?: string;
  size?: number;
  thresholds?: { low: number; high: number };
  className?: string;
}

export function GaugeChart({
  value,
  min = 0,
  max = 100,
  label,
  unit = "%",
  size = 140,
  thresholds = { low: 30, high: 70 },
  className = "",
}: GaugeChartProps) {
  const normalizedValue = Math.min(Math.max(value, min), max);
  const percentage = ((normalizedValue - min) / (max - min)) * 100;

  // Gauge is a 240-degree arc (from -120 to +120)
  const arcAngle = 240;
  const startAngle = 150; // degrees (from 6 o'clock going clockwise, 150 = bottom-left)
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 14;
  const strokeWidth = 12;

  const polarToCartesian = (angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(rad),
      y: cy + radius * Math.sin(rad),
    };
  };

  const describeArc = (startDeg: number, endDeg: number) => {
    const start = polarToCartesian(endDeg);
    const end = polarToCartesian(startDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  };

  const bgArc = describeArc(startAngle, startAngle + arcAngle);
  const valueAngle = startAngle + (percentage / 100) * arcAngle;
  const valueArc = describeArc(startAngle, valueAngle);

  // Color based on thresholds
  let color = "#22c55e"; // green
  if (percentage < ((thresholds.low - min) / (max - min)) * 100) {
    color = "#ef4444"; // red
  } else if (percentage > ((thresholds.high - min) / (max - min)) * 100) {
    color = "#f59e0b"; // amber
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg width={size} height={size * 0.75} viewBox={`0 0 ${size} ${size * 0.85}`}>
        {/* Background arc */}
        <path
          d={bgArc}
          fill="none"
          stroke="currentColor"
          className="text-neutral-200 dark:text-neutral-700"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <motion.path
          d={valueArc}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        {/* Value text */}
        <text x={cx} y={cy + 2} textAnchor="middle" className="fill-neutral-800 dark:fill-white" fontSize={size * 0.18} fontWeight={700}>
          {normalizedValue.toFixed(1)}
        </text>
        <text x={cx} y={cy + size * 0.14} textAnchor="middle" className="fill-neutral-500 dark:fill-neutral-400" fontSize={size * 0.09}>
          {unit}
        </text>
      </svg>
      <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 -mt-1">{label}</span>
      {/* Status dot */}
      <div className="flex items-center gap-1 mt-1">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
          {color === "#22c55e" ? "Optimal" : color === "#ef4444" ? "Critical" : "Warning"}
        </span>
      </div>
    </div>
  );
}
