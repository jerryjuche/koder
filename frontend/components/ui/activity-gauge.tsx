"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { Card } from "@/components/ui/card";

interface ActivityGaugeProps {
  value: number;
  max: number;
  label: string;
}

export function ActivityGauge({ value, max, label }: ActivityGaugeProps) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  const data = [{ name: label, value: percentage, fill: "currentColor" }];

  return (
    <Card className="p-4 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height={170}>
        <RadialBarChart
          data={data}
          innerRadius={48}
          outerRadius={76}
          startAngle={90}
          endAngle={450}
          barSize={12}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            dataKey="value"
            cornerRadius={99}
            className="fill-primary stroke-primary"
            background={{ className: "fill-primary/10" }}
            isAnimationActive
            animationDuration={1200}
            animationEasing="ease-out"
          />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
            <tspan
              x="50%"
              dy="0"
              className="fill-foreground text-3xl font-bold tabular-nums"
            >
              {percentage}%
            </tspan>
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
      <span className="text-xs font-semibold text-foreground text-center mt-1 leading-tight">
        {label}
      </span>
    </Card>
  );
}
