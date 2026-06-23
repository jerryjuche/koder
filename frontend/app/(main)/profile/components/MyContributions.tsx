"use client";

import { useEffect, useState } from "react";
import { UserProblem } from "@/lib/types";
import { fetchMyContributions } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Clock, CheckCircle2, XCircle, ChevronRight, MessageSquare, ArrowUpRight, ArrowUpDown } from "lucide-react";
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
          <div key={i} className="h-24 bg-brand-charcoal-card border border-brand-charcoal-border rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (contributions.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed border-brand-charcoal-border/80 bg-brand-charcoal-base">
        <h3 className="text-lg font-semibold text-brand-offwhite mb-2">No Contributions Yet</h3>
        <p className="text-brand-offwhite-muted mb-6">Start building your legacy by submitting a new problem to the community.</p>
        <a href="/contribute" className="inline-flex items-center justify-center px-4 py-2 bg-brand-muted-gold text-brand-charcoal-base font-semibold rounded-lg hover:bg-brand-muted-gold-dark transition-colors">
          Submit a Problem
        </a>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
      case "rejected": return "text-rose-400 bg-rose-400/10 border-rose-400/20";
      default: return "text-amber-400 bg-amber-400/10 border-amber-400/20";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle2 size={14} className="mr-1.5" />;
      case "rejected": return <XCircle size={14} className="mr-1.5" />;
      default: return <Clock size={14} className="mr-1.5" />;
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-4 mb-4">
        <span className="text-sm text-brand-offwhite-muted">Sort by:</span>
        <button 
          onClick={() => toggleSort("date")}
          className={cn("flex items-center gap-1 text-sm font-medium transition-colors", sortField === "date" ? "text-brand-muted-gold" : "text-brand-offwhite-muted hover:text-brand-offwhite")}
        >
          Date <ArrowUpDown size={14} className={sortField === "date" ? "opacity-100" : "opacity-0"} />
        </button>
        <button 
          onClick={() => toggleSort("status")}
          className={cn("flex items-center gap-1 text-sm font-medium transition-colors", sortField === "status" ? "text-brand-muted-gold" : "text-brand-offwhite-muted hover:text-brand-offwhite")}
        >
          Status <ArrowUpDown size={14} className={sortField === "status" ? "opacity-100" : "opacity-0"} />
        </button>
      </div>

      {sortedContributions.map((prob) => (
        <Card 
          key={prob.id} 
          onClick={() => setSelectedProblem(prob)}
          className="bg-brand-charcoal-card border-brand-charcoal-border hover:border-brand-muted-gold/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group hover:shadow-lg hover:shadow-brand-muted-gold/5"
        >
          <div className="p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-lg text-brand-offwhite truncate">{prob.title}</h3>
                <span className={cn(
                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider",
                  getStatusColor(prob.status)
                )}>
                  {getStatusIcon(prob.status)}
                  {prob.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-brand-offwhite-muted">
                <span className="font-mono">{prob.slug}</span>
                <span>•</span>
                <span>{new Date(prob.created_at).toLocaleDateString()}</span>
                <span>•</span>
                <span className="text-brand-muted-gold font-mono">{prob.xp_reward} XP</span>
              </div>
            </div>
            
            <div className="flex items-center shrink-0">
              <div className="w-10 h-10 rounded-full bg-brand-charcoal-panel flex items-center justify-center text-brand-offwhite-muted group-hover:text-brand-muted-gold group-hover:bg-brand-muted-gold/10 transition-colors">
                <ChevronRight size={20} />
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Detail Modal */}
      {selectedProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-brand-charcoal-card border border-brand-charcoal-border/60 rounded-xl shadow-2xl shadow-black/50 w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-300">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-brand-charcoal-border bg-brand-charcoal-base rounded-t-xl">
              <div>
                <h3 className="text-2xl font-bold text-brand-offwhite flex items-center gap-3">
                  {selectedProblem.title}
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider",
                    getStatusColor(selectedProblem.status)
                  )}>
                    {getStatusIcon(selectedProblem.status)}
                    {selectedProblem.status}
                  </span>
                </h3>
                <p className="text-brand-offwhite-muted font-mono text-sm mt-1">{selectedProblem.slug}</p>
              </div>
              <button 
                onClick={() => setSelectedProblem(null)}
                className="p-2 text-brand-offwhite-muted hover:text-white transition-colors rounded-lg hover:bg-brand-charcoal-hover"
              >
                <XCircle size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-8">
              
              {selectedProblem.admin_notes && (
                <div className="p-4 bg-brand-charcoal-panel/80 rounded-lg border border-brand-charcoal-border flex items-start gap-3">
                  <MessageSquare size={20} className="text-brand-muted-gold shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-brand-offwhite mb-1">Admin Feedback</h4>
                    <p className="text-brand-offwhite-muted text-sm">{selectedProblem.admin_notes}</p>
                  </div>
                </div>
              )}

              {/* Problem Statement */}
              <div>
                <h4 className="text-sm font-semibold text-brand-offwhite-muted uppercase tracking-wider mb-4 border-b border-brand-charcoal-border pb-2">Problem Statement</h4>
                <div className="prose prose-invert prose-brand max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {selectedProblem.statement}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Function Signature */}
              <div>
                <h4 className="text-sm font-semibold text-brand-offwhite-muted uppercase tracking-wider mb-4 border-b border-brand-charcoal-border pb-2">Go Signature</h4>
                <div className="bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg p-4 font-mono text-sm text-brand-offwhite overflow-x-auto">
                  <span className="text-brand-muted-gold">func</span> {selectedProblem.func_name}({selectedProblem.param_types.join(", ")}) {selectedProblem.return_type} {"{"}
                  <br/>
                  <span className="text-brand-offwhite-muted ml-4">{"// implementation"}</span>
                  <br/>
                  {"}"}
                </div>
              </div>

              {/* Test Cases Table */}
              <div>
                <h4 className="text-sm font-semibold text-brand-offwhite-muted uppercase tracking-wider mb-4 border-b border-brand-charcoal-border pb-2">Test Cases ({selectedProblem.test_cases.length})</h4>
                <div className="border border-brand-charcoal-border rounded-lg overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-brand-charcoal-panel text-brand-offwhite-muted border-b border-brand-charcoal-border">
                      <tr>
                        <th className="px-4 py-2 font-medium">Input</th>
                        <th className="px-4 py-2 font-medium">Expected Output</th>
                        <th className="px-4 py-2 font-medium text-center">Hidden</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-charcoal-border">
                      {selectedProblem.test_cases.map((tc, idx) => (
                        <tr key={idx} className="bg-brand-charcoal-base">
                          <td className="px-4 py-3 font-mono text-brand-offwhite">{JSON.stringify(tc.input)}</td>
                          <td className="px-4 py-3 font-mono text-brand-emerald-400">{tc.expected}</td>
                          <td className="px-4 py-3 text-center">
                            {tc.is_hidden ? (
                              <span className="inline-block px-2 py-1 bg-rose-400/10 text-rose-400 rounded text-xs">Yes</span>
                            ) : (
                              <span className="inline-block px-2 py-1 bg-emerald-400/10 text-emerald-400 rounded text-xs">No</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-brand-charcoal-border bg-brand-charcoal-base rounded-b-xl flex justify-between items-center">
              <span className="text-xs text-brand-offwhite-muted">
                Submitted on {new Date(selectedProblem.created_at).toLocaleString()}
              </span>
              <div className="flex gap-3">
                <button 
                  onClick={() => setSelectedProblem(null)}
                  className="px-4 py-2 text-sm font-medium text-brand-offwhite bg-brand-charcoal-panel hover:bg-brand-charcoal-hover rounded-lg transition-colors border border-brand-charcoal-border"
                >
                  Close
                </button>
                {selectedProblem.status === "rejected" && (
                  <a 
                    href={`/contribute?edit=${selectedProblem.id}`}
                    className="px-4 py-2 text-sm font-medium text-brand-charcoal-base bg-brand-muted-gold hover:bg-brand-muted-gold-dark rounded-lg transition-colors flex items-center gap-2"
                  >
                    Re-edit & Resubmit <ArrowUpRight size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
