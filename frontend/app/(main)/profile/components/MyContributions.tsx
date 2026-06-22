"use client";

import { useEffect, useState } from "react";
import { UserProblem } from "@/lib/types";
import { fetchMyContributions } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Clock, CheckCircle2, XCircle, ChevronRight, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MyContributions() {
  const [contributions, setContributions] = useState<UserProblem[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="space-y-4">
      {contributions.map((prob) => (
        <Card key={prob.id} className="bg-brand-charcoal-card border-brand-charcoal-border hover:border-brand-muted-gold/30 transition-colors group">
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
              {prob.admin_notes && (
                <div className="mt-4 p-3 bg-brand-charcoal-panel/50 rounded-lg border border-brand-charcoal-border text-sm text-brand-offwhite-muted flex items-start gap-2">
                  <MessageSquare size={16} className="text-brand-muted-gold shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-brand-offwhite block mb-0.5">Admin Note</span>
                    {prob.admin_notes}
                  </div>
                </div>
              )}
            </div>
            <div className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="text-brand-muted-gold" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
