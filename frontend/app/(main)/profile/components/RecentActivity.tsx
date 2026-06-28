"use client";

import { UserProfile, Submission } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
  profile: UserProfile;
}

export default function RecentActivity({ profile }: RecentActivityProps) {
  const formatDate = (dateString: string) => {
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
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-foreground mb-6">
        Recent Submissions
      </h3>

      {profile.recent_submissions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No submissions yet. Start solving problems!
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {profile.recent_submissions.map((submission: Submission) => (
            <div
              key={submission.id}
              className="bg-muted/30 border border-border rounded-xl p-4 transition-all duration-300 flex items-center justify-between group hover:border-primary/30 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold",
                      submission.status === "passed"
                        ? "bg-emerald-400/10 text-emerald-400"
                        : submission.status === "failed"
                          ? "bg-rose-400/10 text-rose-400"
                          : "bg-amber-400/10 text-amber-400"
                    )}
                  >
                    {submission.status === "passed"
                      ? "P"
                      : submission.status === "failed"
                        ? "F"
                        : "E"}
                  </div>
                  <div>
                    <p className="text-foreground font-medium text-sm">
                      Submission #{submission.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(submission.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    {submission.passed_count}/{submission.total_count} tests
                    passed
                  </span>
                  {submission.runtime_ms > 0 && (
                    <span>• {submission.runtime_ms}ms</span>
                  )}
                </div>
              </div>

              <Badge
                variant={
                  submission.status === "passed"
                    ? "outline"
                    : submission.status === "failed"
                      ? "destructive"
                      : "secondary"
                }
                className={cn(
                  submission.status === "passed" &&
                    "text-emerald-400 border-emerald-400/30 bg-emerald-400/5"
                )}
              >
                {submission.status === "passed"
                  ? "Passed"
                  : submission.status === "failed"
                    ? "Failed"
                    : submission.status === "compiler_error"
                      ? "Compile Error"
                      : "Timeout"}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
