"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

export function ScoreRadar({
  efficiency,
  readability,
  correctness,
  bestPractices,
}: {
  efficiency: number;
  readability: number;
  correctness: number;
  bestPractices: number;
}) {
  const data = [
    { subject: "Efficiency", score: efficiency },
    { subject: "Readability", score: readability },
    { subject: "Correctness", score: correctness },
    { subject: "Best practices", score: bestPractices },
  ];

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card/60 p-2.5">
      <span className="self-start px-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        Skill Breakdown
      </span>
      <div className="h-[150px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="70%">
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#88889A", fontSize: 9 }}
            />
            <Radar
              dataKey="score"
              stroke="#9E77ED"
              fill="#7F56D9"
              fillOpacity={0.35}
              isAnimationActive
              animationDuration={1100}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}