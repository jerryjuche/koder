"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from "recharts";

function grade(score: number): { label: string; barClass: string; textClass: string } {
  if (score >= 85) return { label: "Excellent", barClass: "fill-emerald-500 stroke-emerald-500", textClass: "text-emerald-400" };
  if (score >= 70) return { label: "Good", barClass: "fill-teal-500 stroke-teal-500", textClass: "text-teal-400" };
  if (score >= 50) return { label: "Fair", barClass: "fill-amber-500 stroke-amber-500", textClass: "text-amber-400" };
  return { label: "Needs work", barClass: "fill-rose-500 stroke-rose-500", textClass: "text-rose-400" };
}

export function QualityGauge({ score, label }: { score: number; label: string }) {
  const g = grade(score);
  const data = [{ name: label, value: score, fill: "currentColor" }];

  return (
    <div className="flex flex-col items-center rounded-lg border border-border/60 bg-muted/40 p-3">
      <div className="h-[130px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            data={data}
            innerRadius={32}
            outerRadius={54}
            startAngle={90}
            endAngle={450}
            barSize={12}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar
              dataKey="value"
              cornerRadius={99}
              className={score > 0 ? g.barClass : "fill-primary/20 stroke-primary/20"}
              background={{ className: "fill-primary/10" }}
              isAnimationActive
              animationDuration={1100}
              animationEasing="ease-out"
            />
            <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle">
              <tspan x="50%" dy="0" className="fill-foreground text-lg font-bold tabular-nums">
                {score}
              </tspan>
            </text>
            <text x="50%" y="62%" textAnchor="middle" dominantBaseline="middle" className={g.textClass}>
              <tspan x="50%" dy="0" className="fill-current text-[10px] font-semibold uppercase tracking-wider">
                {g.label}
              </tspan>
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <span className="text-center text-[10px] font-semibold text-muted-foreground leading-tight">
        {label}
      </span>
    </div>
  );
}
