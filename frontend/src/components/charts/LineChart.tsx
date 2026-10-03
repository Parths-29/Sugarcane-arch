import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/line-charts-2";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface DataPoint {
  label: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  className?: string;
  title?: string;
  unit?: string;
  lineColor?: string;
  fillColor?: string;
  showDots?: boolean;
  showArea?: boolean;
}

export function LineChart({
  data,
  height = 250,
  className = "",
  title,
  unit = "",
  lineColor = "#22c55e",
  fillColor,
  showDots = true,
  showArea = true,
}: LineChartProps) {

  const chartConfig = {
    value: {
      label: "Value",
      color: lineColor,
    },
  } satisfies ChartConfig;

  const actualFill = fillColor || lineColor;

  return (
    <Card className={className} variant="default">
      {title && (
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>Trend Analysis {unit && `(${unit})`}</CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <ChartContainer config={chartConfig} style={{ minHeight: height, width: "100%" }}>
          <AreaChart accessibilityLayer data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="fillArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={actualFill} stopOpacity={0.3} />
                <stop offset="95%" stopColor={actualFill} stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8} 
              tickFormatter={(value) => `${value}${unit}`} 
            />
            <ChartTooltip
              cursor={{ stroke: 'var(--color-muted)', strokeWidth: 1.5, strokeDasharray: '4 4' }}
              content={<ChartTooltipContent hideIndicator formatter={(val) => `${val}${unit}`} />}
            />
            <Area
              dataKey="value"
              type="natural"
              fill={showArea ? "url(#fillArea)" : "transparent"}
              fillOpacity={0.4}
              stroke={lineColor}
              strokeWidth={3}
              activeDot={showDots ? { r: 5, fill: lineColor, stroke: "white", strokeWidth: 2 } : false}
              dot={showDots ? { r: 3, fill: "white", stroke: lineColor, strokeWidth: 2 } : false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
