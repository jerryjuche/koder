"use client";

import { useEffect, useState } from "react";
import { UserProblem } from "@/lib/types";
import { fetchMyContributions } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  MessageSquare,
  ArrowUpRight,
  ArrowUpDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MyContributions() {
  const [contributions, setContributions] = useState<UserProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState<UserProblem | null>(null);
  const [sortField, setSortField] = useState<"date" | "status">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const loadContributions = async () => {
      try {
        const res = await fetchMyContributions();
        if (res.success && res.data) {
          setContributions(res.data);
        }
      } catch (err) {
        console.error("Failed to load contributions", err);
      } finally {
        setLoading(false);
      }
    };
    loadContributions();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 bg-card border border-border rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed border-border/80 bg-background">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Contributions Yet
        </h3>
        <p className="text-muted-foreground mb-6">
          Start building your legacy by submitting a new problem to the community.
        </p>
        <Button asChild>
          <a href="/contribute">Submit a Problem</a>
        </Button>
      </Card>
    );
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 size={14} />;
      case "rejected":
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const statusPriority = { pending: 1, rejected: 2, approved: 3 };

  const sortedContributions = [...contributions].sort((a, b) => {
    if (sortField === "status") {
      const pA = statusPriority[a.status as keyof typeof statusPriority] || 0;
      const pB = statusPriority[b.status as keyof typeof statusPriority] || 0;
      return sortDirection === "asc" ? pA - pB : pB - pA;
    } else {
      const dA = new Date(a.created_at).getTime();
      const dB = new Date(b.created_at).getTime();
      return sortDirection === "asc" ? dA - dB : dB - dA;
    }
  });

  const toggleSort = (field: "date" | "status") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const selected = selectedProblem;

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-end gap-4 mb-4">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <button
            onClick={() => toggleSort("date")}
            className={cn(
              "flex items-center gap-1 text-sm font-medium transition-colors",
              sortField === "date"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Date{" "}
            <ArrowUpDown
              size={14}
              className={sortField === "date" ? "opacity-100" : "opacity-0"}
            />
          </button>
          <button
            onClick={() => toggleSort("status")}
            className={cn(
              "flex items-center gap-1 text-sm font-medium transition-colors",
              sortField === "status"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Status{" "}
            <ArrowUpDown
              size={14}
              className={sortField === "status" ? "opacity-100" : "opacity-0"}
            />
          </button>
        </div>

        {sortedContributions.map((prob) => (
          <button
            key={prob.id}
            onClick={() => setSelectedProblem(prob)}
            className="w-full text-left"
          >
            <Card className="hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-primary/5">
              <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-lg text-foreground truncate">
                      {prob.title}
                    </h3>
                    <Badge
                      variant={
                        prob.status === "approved"
                          ? "outline"
                          : prob.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                      className={cn(
                        "gap-1 shrink-0",
                        prob.status === "approved" &&
                          "text-amber-400 border-amber-400/30 bg-amber-400/5"
                      )}
                    >
                      {statusIcon(prob.status)}
                      {prob.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-mono">{prob.slug}</span>
                    <span>•</span>
                    <span>{new Date(prob.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="text-primary font-mono">
                      {prob.xp_reward} XP
                    </span>
                  </div>
                </div>

                <div className="flex items-center shrink-0">
                  <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground transition-colors">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </Card>
          </button>
        ))}
      </div>

      {/* Single detail dialog */}
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => !open && setSelectedProblem(null)}
      >
        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0"
          showCloseButton={false}
        >
          <DialogHeader className="p-6 border-b border-border bg-muted/30 rounded-t-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <DialogTitle className="flex items-center gap-3 text-xl">
                  {selected?.title}
                  {selected && (
                    <Badge
                      variant={
                        selected.status === "approved"
                          ? "outline"
                          : selected.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                      className={cn(
                        "gap-1",
                        selected.status === "approved" &&
                          "text-amber-400 border-amber-400/30 bg-amber-400/5"
                      )}
                    >
                      {statusIcon(selected.status)}
                      {selected.status}
                    </Badge>
                  )}
                </DialogTitle>
                <p className="text-sm text-muted-foreground font-mono mt-1">
                  {selected?.slug}
                </p>
              </div>
              <button
                onClick={() => setSelectedProblem(null)}
                className="shrink-0 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </DialogHeader>

          {selected && (
            <div className="p-6 overflow-y-auto space-y-8 flex-1">
              {selected.admin_notes && (
                <div className="p-4 bg-muted/50 rounded-lg border border-border flex items-start gap-3">
                  <MessageSquare
                    size={20}
                    className="text-primary shrink-0 mt-0.5"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Admin Feedback
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {selected.admin_notes}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">
                  Problem Statement
                </h4>
                <div className="prose prose-invert prose-sm max-w-none text-muted-foreground">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selected.statement}
                  </ReactMarkdown>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">
                  Go Signature
                </h4>
                <div className="bg-muted/50 border border-border rounded-lg p-4 font-mono text-sm text-foreground overflow-x-auto">
                  <span className="text-primary">func</span>{" "}
                  {selected.func_name}({selected.param_types.join(", ")}){" "}
                  {selected.return_type} {"{"}
                  <br />
                  <span className="text-muted-foreground ml-4">
                    {"// implementation"}
                  </span>
                  <br />
                  {"}"}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 border-b border-border pb-2">
                  Test Cases ({selected.test_cases.length})
                </h4>
                <div className="border border-border rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                      <tr>
                        <th className="px-4 py-2 font-medium">Input</th>
                        <th className="px-4 py-2 font-medium">
                          Expected Output
                        </th>
                        <th className="px-4 py-2 font-medium text-center">
                          Hidden
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {selected.test_cases.map((tc, idx) => (
                        <tr key={idx} className="bg-background">
                          <td className="px-4 py-3 font-mono text-foreground">
                            {JSON.stringify(tc.input)}
                          </td>
                          <td className="px-4 py-3 font-mono text-amber-400">
                            {tc.expected}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {tc.is_hidden ? (
                              <Badge variant="destructive" className="text-[10px]">
                                Yes
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-[10px] text-amber-400 border-amber-400/30"
                              >
                                No
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="p-6 border-t border-border bg-muted/30 rounded-b-xl">
            <span className="text-xs text-muted-foreground">
              {selected && `Submitted on ${new Date(selected.created_at).toLocaleString()}`}
            </span>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSelectedProblem(null)}>
                Close
              </Button>
              {selected?.status === "rejected" && (
                <Button asChild>
                  <a
                    href={`/contribute?edit=${selected.id}`}
                    className="flex items-center gap-2"
                  >
                    Re-edit & Resubmit{" "}
                    <ArrowUpRight size={16} />
                  </a>
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
