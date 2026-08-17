"use client";

import React, { useState } from "react";
import {
  Activity,
  CheckCircle2,
  Trophy,
  Heart,
  Sparkles,
  Star,
  ExternalLink,
} from "lucide-react";
import { sendBestPracticesAnnouncement } from "@/lib/api";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export default function BestPracticesAnnouncementPanel() {
  const [subject, setSubject] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [sendToAll, setSendToAll] = useState(false);
  const [sending, setSending] = useState(false);

  const effectiveSubject =
    subject.trim() || "Koder — Discover Best Practices: See how top developers solve problems";

  const canSend = sendToAll || testEmail.trim().length > 0;

  const handleSend = async () => {
    if (!sendToAll && !testEmail.trim()) {
      toast.error("Enter a test email or enable Send to all.");
      return;
    }

    setSending(true);

    const frontendBase = window.location.origin;
    let finalCta = ctaUrl.trim();
    if (!finalCta) {
      finalCta = `${frontendBase}/home?bp_tab=all`;
    } else if (finalCta.startsWith("/")) {
      finalCta = `${frontendBase}${finalCta}`;
    }

    const payload = {
      subject: effectiveSubject,
      cta_url: finalCta,
      test_email: testEmail.trim() || undefined,
      send_to_all: sendToAll,
    };

    const res = await sendBestPracticesAnnouncement(payload);
    setSending(false);

    if (!res.success) {
      toast.error(res.error?.message || "Failed to send announcement.");
      return;
    }

    const attempted = res.data?.attempted ?? 0;
    const sent = res.data?.sent ?? 0;
    const failed = res.data?.failed ?? 0;

    if (sendToAll) {
      toast.success(
        `Best Practices announcement queued to ${attempted} users; ${sent} sent, ${failed} failed.`,
      );
    } else {
      toast.success(`Test email sent to ${testEmail.trim()}.`);
    }
  };

  return (
    <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-brand-charcoal-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-muted-gold/10 border border-brand-muted-gold/20 flex items-center justify-center">
          <Trophy size={18} className="text-brand-muted-gold" />
        </div>
        <div>
          <h3 className="font-bold text-brand-offwhite text-sm">
            Best Practices Announcement
          </h3>
          <p className="text-[11px] text-brand-offwhite-muted mt-1">
            Send an introductory email about the Best Practices feature with live stats and solution previews.
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <label className="space-y-2 text-sm text-brand-offwhite-muted">
          Subject
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Koder — Discover Best Practices: See how top developers solve problems"
            className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl px-3 py-2 text-sm text-brand-offwhite focus:outline-none focus:border-brand-muted-gold"
          />
        </label>

        <label className="space-y-2 text-sm text-brand-offwhite-muted">
          CTA URL (optional)
          <input
            value={ctaUrl}
            onChange={(event) => setCtaUrl(event.target.value)}
            placeholder="Leave blank to use /home?bp_tab=all"
            className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl px-3 py-2 text-sm text-brand-offwhite focus:outline-none focus:border-brand-muted-gold font-mono"
          />
        </label>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <label className="space-y-2 text-sm text-brand-offwhite-muted">
            Test email address
            <input
              value={testEmail}
              onChange={(event) => setTestEmail(event.target.value)}
              placeholder="admin@example.com"
              className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl px-3 py-2 text-sm text-brand-offwhite focus:outline-none focus:border-brand-muted-gold"
            />
          </label>
          <label className="flex items-center gap-3 text-sm text-brand-offwhite-muted">
            <input
              type="checkbox"
              checked={sendToAll}
              onChange={(event) => setSendToAll(event.target.checked)}
              className="h-4 w-4 rounded border-brand-charcoal-border bg-brand-charcoal-base text-brand-muted-gold focus:ring-brand-muted-gold"
            />
            <span>Send to all users</span>
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-brand-offwhite-muted">
            {sendToAll
              ? "This email will be delivered to all registered users with an email address."
              : "Enter a test email to send a single preview email."}
          </div>
          <button
            onClick={handleSend}
            disabled={!canSend || sending}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold transition-all",
              canSend
                ? "bg-brand-muted-gold text-brand-charcoal-base hover:brightness-110"
                : "bg-brand-charcoal-border text-brand-offwhite-muted cursor-not-allowed",
            )}
          >
            {sending ? (
              <Activity className="animate-spin" size={14} />
            ) : (
              <CheckCircle2 size={14} />
            )}
            {sending ? "Sending..." : "Send announcement"}
          </button>
        </div>

        {/* Email preview */}
        <div className="rounded-3xl border border-brand-charcoal-border bg-brand-charcoal-base p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.24em] text-brand-offwhite-muted">
                Email preview
              </p>
              <h4 className="mt-2 text-base font-bold text-brand-offwhite">
                {effectiveSubject}
              </h4>
            </div>
            <div className="rounded-2xl bg-brand-charcoal-border px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-brand-offwhite-muted flex items-center gap-1.5">
              <Trophy size={12} className="text-brand-muted-gold" />
              Feature announcement
            </div>
          </div>

          <div className="space-y-3">
            {/* Stats preview */}
            <div className="rounded-2xl border border-brand-charcoal-border/60 bg-brand-charcoal-card p-3">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <div className="text-lg font-bold text-brand-offwhite">--</div>
                  <div className="text-[10px] text-brand-offwhite-muted uppercase">Solutions</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-brand-offwhite">--</div>
                  <div className="text-[10px] text-brand-offwhite-muted uppercase">Developers</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-brand-offwhite">--</div>
                  <div className="text-[10px] text-brand-offwhite-muted uppercase">Likes</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-brand-offwhite">--</div>
                  <div className="text-[10px] text-brand-offwhite-muted uppercase">Go / Python</div>
                </div>
              </div>
            </div>

            {/* Feature cards preview */}
            <div className="space-y-2">
              {[
                { icon: Heart, label: "Community Solutions", color: "bg-amber-100" },
                { icon: Sparkles, label: "AI-Powered Code Analysis", color: "bg-purple-100" },
                { icon: Star, label: "How to Get Featured", color: "bg-yellow-100" },
              ].map(({ icon: Icon, label, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl border border-brand-charcoal-border/60 bg-brand-charcoal-card px-3 py-2.5"
                >
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
                    <Icon size={14} className="text-brand-muted-gold" />
                  </div>
                  <span className="text-xs font-bold text-brand-offwhite">{label}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-brand-offwhite-muted">
              <ExternalLink size={14} className="text-brand-muted-gold" />
              <span>
                {ctaUrl.trim() || "https://.../home?bp_tab=all"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
