"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
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
    <div className="flex h-[190px] w-full flex-col rounded-lg border border-border/60 bg-muted/40 p-2">
      <div className="px-1 pt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        Skill breakdown
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#88889A", fontSize: 10 }}
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
  );
}
