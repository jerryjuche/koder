"use client";

import { UserProfile, Submission } from "@/lib/types";

interface RecentActivityProps {
  profile: UserProfile;
}

export default function RecentActivity({ profile }: RecentActivityProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "passed":
        return {
          label: "Passed",
          color:
            "bg-brand-success/20 text-brand-success border-brand-success/30",
        };
      case "failed":
        return {
          label: "Failed",
          color: "bg-brand-error/20 text-brand-error border-brand-error/30",
        };
      case "compiler_error":
        return {
          label: "Compile Error",
          color:
            "bg-brand-muted-gold/20 text-brand-muted-gold border-brand-muted-gold/30",
        };
      case "timeout":
        return {
          label: "Timeout",
          color:
            "bg-brand-muted-gold/20 text-brand-muted-gold border-brand-muted-gold/30",
        };
      default:
        return {
          label: status,
          color:
            "bg-brand-charcoal-hover text-brand-offwhite-muted border-brand-charcoal-border",
        };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "passed":
        return "✅";
      case "failed":
        return "❌";
      case "compiler_error":
        return "⚠️";
      case "timeout":
        return "⏱️";
      default:
        return "•";
    }
  };

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
    <div className="bg-brand-charcoal-card rounded-xl border border-brand-charcoal-border p-6">
      <h3 className="text-lg font-semibold text-brand-offwhite mb-6">
        Recent Submissions
      </h3>

      {profile.recent_submissions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-brand-offwhite-muted">
            No submissions yet. Start solving problems!
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {profile.recent_submissions.map((submission: Submission) => {
            const status = getStatusBadge(submission.status);
            const icon = getStatusIcon(submission.status);

            return (
              <div
                key={submission.id}
                className="bg-brand-charcoal-panel border border-brand-charcoal-border rounded-lg p-4 hover:bg-brand-charcoal-hover transition flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{icon}</span>
                    <div>
                      <p className="text-brand-offwhite font-medium">
                        Submission #{submission.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-brand-offwhite-muted">
                        {formatDate(submission.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-brand-offwhite-muted">
                      {submission.passed_count}/{submission.total_count} tests
                      passed
                    </span>
                    {submission.runtime_ms > 0 && (
                      <span className="text-brand-offwhite-muted">
                        • {submission.runtime_ms}ms
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`border rounded-lg px-3 py-1 text-sm font-medium whitespace-nowrap ${status.color}`}
                >
                  {status.label}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
