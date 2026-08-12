"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Mail,
  Megaphone,
  ExternalLink,
} from "lucide-react";
import { Problem } from "@/lib/types";
import { sendProblemReminder } from "@/lib/api";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface EmailBroadcastPanelProps {
  problems: Problem[];
}

export default function EmailBroadcastPanel({
  problems,
}: EmailBroadcastPanelProps) {
  const [selectedSlug, setSelectedSlug] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState(
    "Give your students a strong, focused challenge with this problem.",
  );
  const [ctaLabel, setCtaLabel] = useState("Continue solving");
  const [ctaUrl, setCtaUrl] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [sendToAll, setSendToAll] = useState(false);
  const [sending, setSending] = useState(false);

  const selectedProblem = useMemo(
    () => problems.find((problem) => problem.slug === selectedSlug),
    [problems, selectedSlug],
  );

  const effectiveSubject =
    subject.trim() ||
    (selectedProblem
      ? `Try this problem: ${selectedProblem.title}`
      : "Problem reminder from Koder");
  const effectiveCtaLabel = ctaLabel.trim() || "Continue solving";
  const previewExcerpt = useMemo(() => {
    if (!selectedProblem?.statement) {
      return "Select a problem to preview the reminder.";
    }
    const normalized = selectedProblem.statement.replace(/\s+/g, " ").trim();
    return normalized.length > 160
      ? `${normalized.slice(0, 160)}…`
      : normalized;
  }, [selectedProblem]);

  const canSend =
    !!selectedProblem && (sendToAll || testEmail.trim().length > 0);

  const handleSend = async () => {
    if (!selectedProblem) {
      toast.error("Please select a problem first.");
      return;
    }

    if (!sendToAll && !testEmail.trim()) {
      toast.error("Enter a test email or enable Send to all.");
      return;
    }

    setSending(true);

    // Determine CTA URL: prefer explicit field; otherwise use problem page
    const frontendBase = window.location.origin;
    const targetPath = ctaUrl.trim() || `/problems/${selectedSlug}`;
    // Append redirect_to when it's a site-internal path (starts with /)
    let finalCta = targetPath;
    if (targetPath.startsWith('/')) {
      finalCta = `${frontendBase}${targetPath}`;
      // If path is a problem page, also include redirect_to to ensure post-login return
      const encoded = encodeURIComponent(targetPath);
      finalCta = `${frontendBase}/?redirect_to=${encoded}`;
    }

    const payload = {
      problem_slug: selectedSlug,
      subject: effectiveSubject,
      message: message.trim(),
      cta_label: effectiveCtaLabel,
      cta_url: finalCta,
      test_email: testEmail.trim() || undefined,
      send_to_all: sendToAll,
    };

    const res = await sendProblemReminder(payload);
    setSending(false);

    if (!res.success) {
      toast.error(res.error?.message || "Failed to send reminder email.");
      return;
    }

    const attempted = res.data?.attempted ?? 0;
    const sent = res.data?.sent ?? 0;
    const failed = res.data?.failed ?? 0;

    if (sendToAll) {
      toast.success(
        `Email reminder queued to ${attempted} users; ${sent} sent, ${failed} failed.`,
      );
    } else {
      toast.success(`Test email sent to ${testEmail.trim()}.`);
    }
  };

  return (
    <div className="bg-brand-charcoal-card border border-brand-charcoal-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-brand-charcoal-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-brand-muted-gold/10 border border-brand-muted-gold/20 flex items-center justify-center">
          <Mail size={18} className="text-brand-muted-gold" />
        </div>
        <div>
          <h3 className="font-bold text-brand-offwhite text-sm">
            Problem Reminder Email
          </h3>
          <p className="text-[11px] text-brand-offwhite-muted mt-1">
            Send a spotlight email to all registered users or preview it with a
            test address.
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <label className="space-y-2 text-sm text-brand-offwhite-muted">
            Problem
            <select
              value={selectedSlug}
              onChange={(event) => setSelectedSlug(event.target.value)}
              className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl px-3 py-2 text-sm text-brand-offwhite focus:outline-none focus:border-brand-muted-gold"
            >
              <option value="">Select a problem</option>
              {problems.map((problem) => (
                <option key={problem.id} value={problem.slug}>
                  {problem.title} — {problem.slug}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-brand-offwhite-muted">
            Subject
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder={
                selectedProblem
                  ? `Try this problem: ${selectedProblem.title}`
                  : "Try this problem: ..."
              }
              className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl px-3 py-2 text-sm text-brand-offwhite focus:outline-none focus:border-brand-muted-gold"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <label className="space-y-2 text-sm text-brand-offwhite-muted">
            CTA label
            <input
              value={ctaLabel}
              onChange={(event) => setCtaLabel(event.target.value)}
              placeholder="Continue solving"
              className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl px-3 py-2 text-sm text-brand-offwhite focus:outline-none focus:border-brand-muted-gold"
            />
          </label>

          <label className="space-y-2 text-sm text-brand-offwhite-muted">
            CTA URL
            <input
              value={ctaUrl}
              onChange={(event) => setCtaUrl(event.target.value)}
              placeholder="Leave blank to use problem page"
              className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-xl px-3 py-2 text-sm text-brand-offwhite focus:outline-none focus:border-brand-muted-gold font-mono"
            />
          </label>
        </div>

        <label className="space-y-2 text-sm text-brand-offwhite-muted">
          Custom message
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={4}
            className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-2xl px-3 py-3 text-sm text-brand-offwhite focus:outline-none focus:border-brand-muted-gold resize-none"
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
            {selectedProblem ? (
              <span>
                {sendToAll
                  ? "This email will be delivered to all registered users with an email address."
                  : "Enter a test email to send a single preview email."}
              </span>
            ) : (
              <span>Select a problem to enable sending.</span>
            )}
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
            {sending ? "Sending..." : "Send reminder"}
          </button>
        </div>

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
            <div className="rounded-2xl bg-brand-charcoal-border px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-brand-offwhite-muted">
              {selectedProblem ? "Problem spotlight" : "No problem selected"}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-brand-charcoal-border/60 bg-brand-charcoal-card p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-brand-offwhite">
                    {selectedProblem?.title ?? "Problem title"}
                  </p>
                  <p className="text-xs text-brand-offwhite-muted mt-1">
                    {selectedProblem
                      ? `Difficulty ${selectedProblem.difficulty}, ${selectedProblem.xpReward} XP`
                      : "Problem details will appear here."}
                  </p>
                </div>
                <span className="rounded-full border border-brand-charcoal-border px-2 py-1 text-[11px] text-brand-offwhite-muted">
                  {selectedProblem?.slug ?? "slug"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-brand-offwhite-muted">
                {previewExcerpt}
              </p>
            </div>

            <div className="rounded-3xl border border-brand-charcoal-border/60 bg-brand-charcoal-card p-4">
              <p className="text-sm text-brand-offwhite-muted">
                {message.trim() || "Custom message appears here."}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="rounded-3xl bg-brand-charcoal-base px-4 py-3 text-sm text-brand-offwhite-muted">
                {selectedProblem
                  ? `Button: ${effectiveCtaLabel}`
                  : "CTA label preview"}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-brand-offwhite-muted">
                <ExternalLink size={14} className="text-brand-muted-gold" />
                <span>
                  {ctaUrl.trim() ||
                    `https://.../problems/${selectedProblem?.slug ?? "slug"}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
