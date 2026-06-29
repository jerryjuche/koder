"use client";

import { useMemo } from "react";
import { ActivityEntry } from "@/lib/types";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphTotalCount,
  ContributionGraphLegend,
} from "@/components/kibo-ui/contribution-graph";

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
      <Card className="p-6">
        <h3 className="text-lg font-bold text-foreground mb-2">Activity</h3>
        <p className="text-muted-foreground text-sm">
          No activity data yet. Start solving problems to see your contribution graph.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-foreground mb-4">Activity</h3>
      <ContributionGraph data={graphData} totalCount={totalActivity}>
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
                      className="cursor-pointer transition-all duration-150 hover:opacity-80 hover:brightness-125"
                      dayIndex={dayIndex}
                      weekIndex={weekIndex}
                    />
                  </g>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs space-y-1">
                  <p className="font-semibold text-sm">{act.date}</p>
                  {dayActivity && (
                    <>
                      <p>Submissions: {dayActivity.submissions}</p>
                      <p>Solved: {dayActivity.solved}</p>
                      <p>Tests run: {dayActivity.tests_run}</p>
                    </>
                  )}
                  {!dayActivity || dayActivity.submissions === 0 ? (
                    <p className="text-muted-foreground">No activity</p>
                  ) : null}
                </TooltipContent>
              </Tooltip>
            );
          }}
        </ContributionGraphCalendar>
        <ContributionGraphFooter>
          <ContributionGraphTotalCount />
          <ContributionGraphLegend />
        </ContributionGraphFooter>
      </ContributionGraph>
    </Card>
  );
}
