// @ts-nocheck
import React, { useState } from 'react';
import { Pie } from '@visx/shape';
import type { ProvidedProps, PieArcDatum } from '@visx/shape';
import { scaleOrdinal } from '@visx/scale';
import { Group } from '@visx/group';
import { GradientPinkBlue } from '@visx/gradient';
import { animated, useTransition, interpolate } from '@react-spring/web';

// We accept any data structure as long as we know how to get the label and value
export interface PieChartProps<T> {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  animate?: boolean;
  data: T[];
  getLabel: (d: T) => string;
  getValue: (d: T) => number;
  getColor?: (d: T) => string;
}

// react-spring transition definitions
type AnimatedStyles = { startAngle: number; endAngle: number; opacity: number };

export default function PieChart<T>({
  width,
  height,
  margin = { top: 20, right: 20, bottom: 20, left: 20 },
  animate = true,
  data,
  getLabel,
  getValue,
  getColor,
}: PieChartProps<T>) {
  const [activeSegment, setActiveSegment] = useState<T | null>(null);

  if (width < 10 || height < 10) return null;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;
  const donutThickness = 50;

  // Colors
  const defaultColors = ['#f6c431', '#32de84', '#16b8f3', '#f1416c', '#7239ea', '#50cd89'];
  const colorScale = scaleOrdinal({
    domain: data.map(getLabel),
    range: defaultColors,
  });

  return (
    <svg width={width} height={height}>
      <GradientPinkBlue id="visx-pie-gradient" />
      <rect rx={14} width={width} height={height} fill="transparent" />
      <Group top={centerY + margin.top} left={centerX + margin.left}>
        <Pie
          data={activeSegment ? data.filter((d) => getLabel(d) === getLabel(activeSegment)) : data}
          pieValue={getValue}
          outerRadius={radius}
          innerRadius={radius - donutThickness}
          cornerRadius={3}
          padAngle={0.005}
        >
          {(pie) => (
            <AnimatedPie<T>
              {...pie}
              animate={animate}
              getKey={(arc) => getLabel(arc.data)}
              onClickDatum={({ data: datum }) =>
                animate && setActiveSegment(activeSegment && getLabel(activeSegment) === getLabel(datum) ? null : datum)
              }
              getColor={(arc) => getColor?.(arc.data) || colorScale(getLabel(arc.data))}
            />
          )}
        </Pie>
      </Group>
      {activeSegment && (
        <text
          x={centerX + margin.left}
          y={centerY + margin.top}
          textAnchor="middle"
          fill="#333"
          className="text-2xl font-bold dark:fill-white"
        >
          {getValue(activeSegment)}
        </text>
      )}
    </svg>
  );
}

// react-spring transition component
type AnimatedPieProps<T> = ProvidedProps<T> & {
  animate?: boolean;
  getKey: (d: PieArcDatum<T>) => string;
  getColor: (d: PieArcDatum<T>) => string;
  onClickDatum: (d: PieArcDatum<T>) => void;
  delay?: number;
};

function AnimatedPie<T>({
  arcs,
  path,
  getKey,
  getColor,
  onClickDatum,
  animate,
}: AnimatedPieProps<T>) {
  const transitions = useTransition<PieArcDatum<T>, AnimatedStyles>(arcs, {
    from: animate ? { startAngle: 0, endAngle: 0, opacity: 0 } : { startAngle: 0, endAngle: 0, opacity: 1 },
    enter: (arc) => ({
      startAngle: arc.startAngle,
      endAngle: arc.endAngle,
      opacity: 1,
    }),
    update: (arc) => ({
      startAngle: arc.startAngle,
      endAngle: arc.endAngle,
      opacity: 1,
    }),
    leave: animate
      ? { startAngle: 0, endAngle: 0, opacity: 0 }
      : { startAngle: 0, endAngle: 0, opacity: 1 },
    keys: getKey,
  });

  return transitions((props, arc, { key }) => {
    return (
      <g key={key}>
        <animated.path
          d={interpolate([props.startAngle, props.endAngle], (startAngle, endAngle) =>
            path({
              ...arc,
              startAngle,
              endAngle,
            })
          )}
          fill={getColor(arc)}
          onClick={() => onClickDatum(arc)}
          onTouchStart={() => onClickDatum(arc)}
          className="transition-opacity duration-200 ease-out cursor-pointer hover:opacity-80"
        />
      </g>
    );
  });
}
