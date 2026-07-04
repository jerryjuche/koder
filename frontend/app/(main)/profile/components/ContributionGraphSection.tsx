"use client";

import { useMemo } from "react";
import { ActivityEntry } from "@/lib/types";
import { CalendarDays, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphTotalCount,
  ContributionGraphLegend,
} from "@/components/kibo-ui/contribution-graph";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ContributionGraphSectionProps {
  activity: ActivityEntry[];
}

function getActivityLevel(count: number, maxCount: number): number {
  if (count === 0) return 0;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

const levelColors = [
  "fill-[#1E1E2A]",
  "fill-amber-500/15",
  "fill-amber-500/30",
  "fill-amber-500/55",
  "fill-amber-500",
];

export default function ContributionGraphSection({ activity }: ContributionGraphSectionProps) {
  const maxCount = useMemo(
    () => Math.max(1, ...activity.map((a) => a.submissions + a.solved)),
    [activity]
  );

  const graphData = useMemo(
    () =>
      activity.map((a) => ({
        date: a.date,
        count: a.submissions + a.solved,
        level: getActivityLevel(a.submissions + a.solved, maxCount),
      })),
    [activity, maxCount]
  );

  const totalActivity = useMemo(
    () => activity.reduce((sum, a) => sum + a.submissions + a.solved, 0),
    [activity]
  );

  if (activity.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Code2 size={32} className="text-white/10 mb-3" />
        <p className="text-sm text-white/40">
          No activity data yet. Start solving problems to see your contribution graph.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <ContributionGraph
        data={graphData}
        totalCount={totalActivity}
        blockSize={11}
        blockMargin={3}
        blockRadius={2}
        labels={{
          legend: { less: "Less", more: "More" },
        }}
      >
        <ContributionGraphCalendar>
          {({ activity: act, dayIndex, weekIndex }) => {
            const dayActivity = activity.find(
              (a) => a.date === act.date
            );
            return (
              <Tooltip>
                <TooltipTrigger asChild>
                  <g>
                    <ContributionGraphBlock
                      activity={act}
                      className={cn(
                        "cursor-pointer transition-all duration-150 hover:opacity-80 hover:brightness-125",
                        levelColors[act.level] || levelColors[0]
                      )}
                      dayIndex={dayIndex}
                      weekIndex={weekIndex}
                    />
                  </g>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-[#1A1A24]/95 border border-white/8 text-white/80 backdrop-blur-md text-xs space-y-0.5"
                >
                  <p className="font-semibold text-white text-sm">{act.date}</p>
                  {dayActivity && dayActivity.submissions > 0 ? (
                    <>
                      <p>{dayActivity.submissions} submission{dayActivity.submissions !== 1 ? "s" : ""}</p>
                      {dayActivity.solved > 0 && (
                        <p className="text-green-400/80">{dayActivity.solved} solved</p>
                      )}
                      <p className="text-white/40">{dayActivity.tests_run} tests run</p>
                    </>
                  ) : (
                    <p className="text-white/40">No activity</p>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          }}
        </ContributionGraphCalendar>
        <ContributionGraphFooter className="flex items-center justify-between mt-2">
          <ContributionGraphTotalCount>
            {({ totalCount, year }) => (
              <span className="text-xs text-white/40">
                <span className="text-white/70 font-semibold">{totalCount}</span> contributions in {year}
              </span>
            )}
          </ContributionGraphTotalCount>
          <ContributionGraphLegend>
            {({ level }) => (
              <svg height={11} width={11}>
                <title>{`Level ${level}`}</title>
                <rect
                  className={levelColors[level] || levelColors[0]}
                  data-level={level}
                  height={11}
                  rx={2}
                  ry={2}
                  width={11}
                />
              </svg>
            )}
          </ContributionGraphLegend>
        </ContributionGraphFooter>
      </ContributionGraph>
    </div>
  );
}
