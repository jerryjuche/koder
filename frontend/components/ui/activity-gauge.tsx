"use client";

import { useRef, useEffect, useState } from "react";
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";
import { Card } from "@/components/ui/card";

interface ActivityGaugeProps {
  value: number;
  max: number;
  label: string;
  colorClass?: string;
}

const MODULE_GAUGE_COLORS: string[] = [
  "fill-blue-500 stroke-blue-500",
  "fill-emerald-500 stroke-emerald-500",
  "fill-purple-500 stroke-purple-500",
  "fill-amber-500 stroke-amber-500",
  "fill-rose-500 stroke-rose-500",
  "fill-violet-500 stroke-violet-500",
  "fill-cyan-500 stroke-cyan-500",
  "fill-fuchsia-500 stroke-fuchsia-500",
  "fill-green-500 stroke-green-500",
  "fill-red-500 stroke-red-500",
  "fill-teal-500 stroke-teal-500",
  "fill-orange-500 stroke-orange-500",
  "fill-indigo-500 stroke-indigo-500",
  "fill-pink-500 stroke-pink-500",
  "fill-lime-500 stroke-lime-500",
  "fill-yellow-500 stroke-yellow-500",
];

let colorIndex = 0;
function nextColor(): string {
  const c = MODULE_GAUGE_COLORS[colorIndex % MODULE_GAUGE_COLORS.length];
  colorIndex++;
  return c;
}

export function ActivityGauge({ value, max, label, colorClass }: ActivityGaugeProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [gaugeHeight, setGaugeHeight] = useState(170);
  const gaugeColor = colorClass || nextColor();
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  const data = [{ name: label, value: percentage, fill: "currentColor" }];

  useEffect(() => {
    function updateSize() {
      if (cardRef.current) {
        const w = cardRef.current.clientWidth;
        setGaugeHeight(Math.min(Math.max(w * 0.85, 120), 200));
      }
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const radius = Math.min(gaugeHeight * 0.22, 48);

  return (
    <Card ref={cardRef} className="p-3 flex flex-col items-center justify-center overflow-hidden">
      <ResponsiveContainer width="100%" height={gaugeHeight}>
        <RadialBarChart
          data={data}
          innerRadius={radius * 0.65}
          outerRadius={radius * 1.02}
          startAngle={90}
          endAngle={450}
          barSize={Math.max(radius * 0.17, 8)}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            dataKey="value"
            cornerRadius={99}
            className={percentage > 0 ? gaugeColor : "fill-primary/20 stroke-primary/20"}
            background={{ className: "fill-primary/10" }}
            isAnimationActive
            animationDuration={1200}
            animationEasing="ease-out"
          />
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
            <tspan
              x="50%"
              dy="0"
              className="fill-foreground text-xl font-bold tabular-nums"
            >
              {percentage}%
            </tspan>
          </text>
        </RadialBarChart>
      </ResponsiveContainer>
      <span className="text-[10px] font-semibold text-foreground text-center mt-0.5 leading-tight line-clamp-2 max-w-full px-1">
        {label}
      </span>
    </Card>
  );
}
