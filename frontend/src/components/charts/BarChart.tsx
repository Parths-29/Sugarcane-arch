import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/line-charts-2";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useMemo } from "react";

interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
  className?: string;
  title?: string;
  unit?: string;
  barColor?: string;
}

export function BarChart({ data, height = 250, className = "", title, unit = "", barColor = "var(--color-value)" }: BarChartProps) {
  
  const chartConfig = {
    value: {
      label: "Value",
      color: barColor,
    },
  } satisfies ChartConfig;

  // Add colors if defined
  const processedData = useMemo(() => {
    return data.map(d => ({
      ...d,
      fill: d.color || "var(--color-value)",
    }));
  }, [data]);

  return (
    <Card className={className} variant="default">
      {title && (
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>Bar Chart Data {unit && `(${unit})`}</CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <ChartContainer config={chartConfig} style={{ minHeight: height, width: "100%" }}>
          <RechartsBarChart accessibilityLayer data={processedData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 10)}
            />
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tickMargin={8} 
              tickFormatter={(value) => `${value}${unit}`} 
            />
            <ChartTooltip
              cursor={{ fill: 'var(--color-muted)', opacity: 0.2 }}
              content={<ChartTooltipContent hideIndicator formatter={(val) => `${val}${unit}`} />}
            />
            <Bar dataKey="value" fill="var(--color-value)" radius={4} />
          </RechartsBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
