import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VisxPieChart from "@/components/ui/pie-chart";
import { ParentSize } from "@visx/responsive";

interface PieSlice {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieSlice[];
  size?: number;
  innerRadius?: number;
  className?: string;
  title?: string;
}

export function PieChart({ data, size = 220, className = "", title }: PieChartProps) {
  
  return (
    <Card className={className} variant="default">
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="flex flex-col items-center justify-center pt-4">
        <div style={{ width: size, height: size }}>
          <ParentSize>
            {({ width, height }) => (
              <VisxPieChart<PieSlice>
                width={width}
                height={height}
                data={data}
                getLabel={(d) => d.label}
                getValue={(d) => d.value}
                getColor={(d) => d.color}
                margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
              />
            )}
          </ParentSize>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 mt-6 justify-center w-full">
          {data.map((slice, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 font-medium">
              <span className="w-3 h-3 rounded-[2px] flex-shrink-0" style={{ backgroundColor: slice.color }} />
              <span>{slice.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
