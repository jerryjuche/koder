"use client";

import { useEffect, useState } from "react";
import { UserProblem } from "@/lib/types";
import { fetchPendingContributions, approveContribution, rejectContribution } from "@/lib/api";
import { toast } from "@/lib/toast";
import { Check, X, Code, MessageSquare, ExternalLink, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  compact?: boolean;
}

export default function PendingContributions({ compact }: Props) {
  const [pending, setPending] = useState<UserProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProblem, setSelectedProblem] = useState<UserProblem | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [note, setNote] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      const res = await fetchPendingContributions();
      if (res.success && res.data) {
        setPending(res.data);
      }
      setLoading(false);
    };
    loadData();
  }, [refreshKey]);

  const handleApprove = async (id: string) => {
    const res = await approveContribution(id, note);
    if (res.success) {
      toast.success("Problem approved and published!");
      setSelectedProblem(null);
      setNote("");
      setRefreshKey(prev => prev + 1);
    } else {
      toast.error(res.error?.message || "Failed to approve");
    }
  };

  const handleReject = async (id: string) => {
    if (!note) {
      toast.error("You must provide a note when rejecting.");
      return;
    }
    const res = await rejectContribution(id, note);
    if (res.success) {
      toast.success("Problem rejected.");
      setSelectedProblem(null);
      setNote("");
      setRefreshKey(prev => prev + 1);
    } else {
      toast.error(res.error?.message || "Failed to reject");
    }
  };

  if (loading) return <div className="text-brand-offwhite-muted">Loading pending contributions...</div>;

  if (pending.length === 0) {
    return <div className="text-brand-offwhite-muted py-6 text-center text-sm">No pending contributions to review.</div>;
  }

  return (
    <div className={compact ? "" : "space-y-6"}>
      {!compact && <h2 className="text-2xl font-bold text-brand-offwhite font-display">Pending Contributions</h2>}
      
      {/* Table View */}
      <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-brand-offwhite">
            <thead className="bg-brand-charcoal-panel text-brand-offwhite-muted border-b border-brand-charcoal-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Title</th>
                <th className="px-6 py-4 font-semibold">Contributor</th>
                <th className="px-6 py-4 font-semibold">Difficulty</th>
                <th className="px-6 py-4 font-semibold">XP Reward</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((p) => (
                <tr 
                  key={p.id} 
                  className="border-b border-brand-charcoal-border/50 hover:bg-brand-charcoal-hover/30 transition-colors group cursor-pointer"
                  onClick={() => setSelectedProblem(p)}
                >
                  <td className="px-6 py-4">
                    <div className="font-semibold text-brand-offwhite">{p.title}</div>
                    <div className="text-brand-offwhite-muted text-xs font-mono">{p.slug}</div>
                  </td>
                  <td className="px-6 py-4">{p.author_name || "Unknown"}</td>
                  <td className="px-6 py-4">{p.difficulty}/5</td>
                  <td className="px-6 py-4 text-brand-muted-gold font-mono">{p.xp_reward}</td>
                  <td className="px-6 py-4 text-brand-offwhite-muted">{new Date(p.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="outline" size="sm" onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProblem(p);
                    }}>
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rich Modal */}
      {selectedProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
          <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-brand-charcoal-card border-brand-charcoal-border shadow-2xl relative my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-brand-charcoal-border flex justify-between items-start shrink-0">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-brand-offwhite">{selectedProblem.title}</h3>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(selectedProblem.slug);
                      toast.success("Slug copied!");
                    }}
                    className="p-1 text-brand-offwhite-muted hover:text-brand-offwhite transition-colors rounded-md hover:bg-brand-charcoal-hover"
                    title="Copy Slug"
                  >
                    <Copy size={14} />
                  </button>
                </div>
                <p className="text-sm text-brand-offwhite-muted mt-1">by {selectedProblem.author_name} • {selectedProblem.xp_reward} XP • Difficulty {selectedProblem.difficulty}/5</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-charcoal-base bg-brand-muted-gold hover:bg-brand-muted-gold-dark rounded-md transition-colors"
                >
                  {previewMode ? <Code size={16} /> : <ExternalLink size={16} />}
                  {previewMode ? "Exit Preview" : "Preview as Student"}
                </button>
                <button onClick={() => setSelectedProblem(null)} className="text-brand-offwhite-muted hover:text-brand-offwhite">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {previewMode ? (
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Mock Workspace Split - Left Side */}
                  <div className="flex-1 border border-brand-charcoal-border rounded-xl bg-brand-charcoal-base p-6">
                    <h2 className="text-2xl font-bold text-brand-offwhite mb-4">{selectedProblem.title}</h2>
                    <div className="flex items-center gap-3 text-xs text-brand-offwhite-muted mb-6">
                      <span className="px-2 py-1 bg-brand-charcoal-panel rounded-full text-brand-muted-gold border border-brand-muted-gold/20">{selectedProblem.xp_reward} XP</span>
                      <span className="px-2 py-1 bg-brand-charcoal-panel rounded-full border border-brand-charcoal-border">Difficulty: {selectedProblem.difficulty}/5</span>
                    </div>
                    <div className="prose prose-invert prose-brand max-w-none prose-sm">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {selectedProblem.statement}
                      </ReactMarkdown>
                    </div>
                  </div>
                  {/* Mock Workspace Split - Right Side (Editor) */}
                  <div className="flex-1 border border-brand-charcoal-border rounded-xl bg-[#0d1117] flex flex-col overflow-hidden">
                    <div className="bg-[#161b22] px-4 py-2 border-b border-brand-charcoal-border flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                      <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                      <span className="text-xs text-brand-offwhite-muted ml-2 font-mono">solution.go</span>
                    </div>
                    <div className="p-4 font-mono text-sm">
                      <span className="text-purple-400">package</span> main<br/><br/>
                      <span className="text-purple-400">func</span> <span className="text-blue-400">{selectedProblem.func_name}</span>({selectedProblem.param_types.join(", ")}) {selectedProblem.return_type} {"{"}<br/>
                                             <span className="text-amber-600 ml-4">{"// Write your code here"}</span><br/>
                      {"}"}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Statement Preview */}
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
                      <span className="text-brand-muted-gold">func</span> {selectedProblem.func_name}({selectedProblem.param_types.join(", ")}) {selectedProblem.return_type} {'{'}
                      <br/>
                      <span className="text-brand-offwhite-muted ml-4">{"// implementation"}</span>
                      <br/>
                      {'}'}
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
                        <tbody className="divide-y divide-brand-charcoal-border/50">
                          {selectedProblem.test_cases.map((tc, idx) => (
                            <tr key={idx} className="bg-brand-charcoal-base">
                              <td className="px-4 py-3 font-mono text-xs">{JSON.stringify(tc.input)}</td>
                              <td className="px-4 py-3 font-mono text-xs text-brand-success">{tc.expected}</td>
                              <td className="px-4 py-3 text-center text-brand-offwhite-muted">
                                {tc.is_hidden ? <Check size={16} className="mx-auto text-brand-muted-gold" /> : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer / Action Area */}
            <div className="p-6 border-t border-brand-charcoal-border bg-brand-charcoal-panel shrink-0 space-y-4">
              <textarea 
                className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg p-3 text-sm text-brand-offwhite placeholder:text-brand-offwhite-muted/50 focus:outline-none focus:border-brand-muted-gold transition-colors"
                placeholder="Admin note (required for rejection, optional for approval)..."
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <Button variant="outline" className="border-brand-charcoal-border text-brand-offwhite" onClick={() => setSelectedProblem(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" className="bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/50" onClick={() => handleReject(selectedProblem.id)}>
                  <X className="w-4 h-4 mr-2" /> Reject
                </Button>
                <Button className="bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border border-amber-500/50" onClick={() => handleApprove(selectedProblem.id)}>
                  <Check className="w-4 h-4 mr-2" /> Approve & Publish
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
