"use client";

import { UserProfile, Submission } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  TestTube,
} from "lucide-react";

interface RecentActivityProps {
  profile: UserProfile;
}

const statusConfig: Record<string, { icon: React.ElementType; label: string; color: string; bg: string; dotColor: string }> = {
  passed: {
    icon: CheckCircle2,
    label: "Passed",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    dotColor: "bg-amber-400",
  },
  failed: {
    icon: XCircle,
    label: "Failed",
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    dotColor: "bg-rose-400",
  },
  compiler_error: {
    icon: AlertTriangle,
    label: "Compile Error",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    dotColor: "bg-amber-400",
  },
  timeout: {
    icon: Clock,
    label: "Timeout",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    dotColor: "bg-orange-400",
  },
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function RecentActivity({ profile }: RecentActivityProps) {
  const submissions = profile.recent_submissions;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-foreground mb-6">Recent Submissions</h3>

      {submissions.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
            <TestTube size={24} className="text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">
            No submissions yet. Start solving problems!
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {submissions.map((submission: Submission, idx: number) => {
              const config = statusConfig[submission.status] || statusConfig.failed;
              const Icon = config.icon;

              return (
                <div
                  key={submission.id}
                  className={cn(
                    "relative flex gap-4 pl-10 transition-all duration-300",
                    "group"
                  )}
                >
                  {/* Timeline dot */}
                  <div
                    className={cn(
                      "absolute left-[14px] w-3 h-3 rounded-full border-2 border-background mt-1.5",
                      config.dotColor
                    )}
                  />

                  {/* Content card */}
                  <Card className="flex-1 p-4 hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 cursor-default">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                            config.bg
                          )}
                        >
                          <Icon size={16} className={config.color} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-foreground font-medium text-sm">
                            Submission #{submission.id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDate(submission.created_at)}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5">
                            <span>
                              {submission.passed_count}/{submission.total_count} tests passed
                            </span>
                            {submission.runtime_ms > 0 && (
                              <>
                                <span>•</span>
                                <span>{submission.runtime_ms}ms</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant={
                              submission.status === "passed"
                                ? "outline"
                                : submission.status === "failed"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className={cn(
                              "shrink-0",
                              submission.status === "passed" &&
                                "text-amber-400 border-amber-400/30 bg-amber-400/5"
                            )}
                          >
                            {config.label}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="text-xs">
                          {submission.status === "passed"
                            ? "All tests passed"
                            : submission.status === "failed"
                              ? "Some tests failed"
                              : submission.status === "compiler_error"
                                ? "Code did not compile"
                                : "Execution timed out"}
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
