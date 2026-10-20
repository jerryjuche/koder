"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ExternalLink,
  Eye,
  Monitor,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { previewEmailTemplate } from "@/lib/api";
import { EmailPreview, EmailTemplateId, Problem } from "@/lib/types";

const TEMPLATES: { id: EmailTemplateId; label: string; hint: string }[] = [
  {
    id: "problem_reminder",
    label: "Problem reminder",
    hint: "Spotlight a single problem (broadcast + single send)",
  },
  {
    id: "best_practices",
    label: "Best Practices announcement",
    hint: "Live community stats and top solutions",
  },
  {
    id: "password_reset",
    label: "Password reset",
    hint: "Sent automatically when a reset is requested",
  },
];

const PREVIEW_DEBOUNCE_MS = 300;

interface Props {
  problems: Problem[];
}

export default function EmailPreviewPanel({ problems }: Props) {
  const [template, setTemplate] = useState<EmailTemplateId>("problem_reminder");
  const [problemSlug, setProblemSlug] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");

  const [preview, setPreview] = useState<EmailPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settledKey, setSettledKey] = useState("");

  const needsProblem = template === "problem_reminder";
  // Default to the first problem so the panel renders something on open
  // without an extra effect round-trip.
  const effectiveSlug = problemSlug || problems[0]?.slug || "";
  const missingProblem = needsProblem && !effectiveSlug;
  // While the problem list is still loading, show the spinner instead of an
  // error — the selection resolves itself as soon as problems arrive.
  const waitingForProblems = needsProblem && problems.length === 0;

  const request = useMemo(
    () => ({
      template,
      problem_slug: needsProblem ? effectiveSlug || undefined : undefined,
      cta_url: ctaUrl.trim() || undefined,
    }),
    [template, needsProblem, effectiveSlug, ctaUrl],
  );

  // Identity of the current request — preview is stale until the key matches.
  const requestKey = `${JSON.stringify(request)}#${reloadKey}`;
  const loading = !missingProblem && settledKey !== requestKey;
  const visibleError = missingProblem
    ? waitingForProblems
      ? null
      : "Select a problem to preview the reminder email."
    : error;

  useEffect(() => {
    if (missingProblem) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      const res = await previewEmailTemplate(request);
      if (cancelled) return;

      if (!res.success || !res.data) {
        setPreview(null);
        setError(res.error?.message || "Failed to render the email preview.");
      } else {
        setPreview(res.data);
        setError(null);
      }
      setSettledKey(requestKey);
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [request, requestKey, missingProblem]);

  const openInNewTab = useCallback(() => {
    if (!preview) return;
    // Blob URLs inherit this app's CSP (inline styles + data: images), so the
    // email renders standalone without shipping the CID attachment.
    const url = URL.createObjectURL(
      new Blob([preview.html], { type: "text/html" }),
    );
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }, [preview]);

  const selectedTemplate = TEMPLATES.find((t) => t.id === template);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <label className="space-y-1.5 text-[11px] uppercase tracking-[0.16em] text-brand-offwhite-muted">
          Template
          <select
            value={template}
            onChange={(event) =>
              setTemplate(event.target.value as EmailTemplateId)
            }
            className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg px-3 py-2 text-sm normal-case tracking-normal text-brand-offwhite focus:outline-none focus:border-brand-muted-gold"
          >
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        {needsProblem ? (
          <label className="space-y-1.5 text-[11px] uppercase tracking-[0.16em] text-brand-offwhite-muted">
            Problem
            <select
              value={effectiveSlug}
              onChange={(event) => setProblemSlug(event.target.value)}
              className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg px-3 py-2 text-sm normal-case tracking-normal text-brand-offwhite focus:outline-none focus:border-brand-muted-gold"
            >
              <option value="">Select a problem</option>
              {problems.map((problem) => (
                <option key={problem.id} value={problem.slug}>
                  {problem.title} — {problem.slug}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <div className="hidden lg:block" />
        )}

        <label className="space-y-1.5 text-[11px] uppercase tracking-[0.16em] text-brand-offwhite-muted">
          CTA URL (optional)
          <input
            value={ctaUrl}
            onChange={(event) => setCtaUrl(event.target.value)}
            placeholder="Leave blank for the default destination"
            className="w-full bg-brand-charcoal-base border border-brand-charcoal-border rounded-lg px-3 py-2 text-sm normal-case tracking-normal font-mono text-brand-offwhite placeholder:text-brand-offwhite-muted/50 focus:outline-none focus:border-brand-muted-gold"
          />
        </label>
      </div>

      {/* Metadata + actions */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-brand-charcoal-border bg-brand-charcoal-base px-2.5 py-1 text-[11px] text-brand-offwhite-muted">
          {selectedTemplate?.hint}
        </span>
        {preview && (
          <>
            <span className="rounded-full border border-brand-charcoal-border bg-brand-charcoal-base px-2.5 py-1 text-[11px] text-brand-offwhite-muted font-mono">
              From: {preview.from || "—"}
            </span>
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px]",
                preview.send_ready
                  ? "border-brand-success/20 bg-brand-success/10 text-brand-success"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-400",
              )}
            >
              {preview.send_ready
                ? "Resend configured"
                : "Resend API key missing — sending will fail"}
            </span>
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-brand-charcoal-border overflow-hidden">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              aria-pressed={viewport === "desktop"}
              aria-label="Preview at desktop width"
              className={cn(
                "px-2 py-1.5 transition-colors",
                viewport === "desktop"
                  ? "bg-brand-muted-gold/15 text-brand-muted-gold"
                  : "text-brand-offwhite-muted hover:text-brand-offwhite",
              )}
            >
              <Monitor size={14} />
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              aria-pressed={viewport === "mobile"}
              aria-label="Preview at mobile width"
              className={cn(
                "px-2 py-1.5 transition-colors",
                viewport === "mobile"
                  ? "bg-brand-muted-gold/15 text-brand-muted-gold"
                  : "text-brand-offwhite-muted hover:text-brand-offwhite",
              )}
            >
              <Smartphone size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            disabled={loading || missingProblem}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-charcoal-border px-2.5 py-1.5 text-[11px] text-brand-offwhite-muted hover:text-brand-offwhite hover:border-brand-charcoal-hover transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={cn(loading && "animate-spin")} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openInNewTab}
            disabled={!preview}
            className="inline-flex items-center gap-1.5 rounded-lg border border-brand-muted-gold/40 px-2.5 py-1.5 text-[11px] text-brand-muted-gold hover:bg-brand-muted-gold/10 transition-colors disabled:opacity-50"
          >
            <ExternalLink size={13} />
            Open in new tab
          </button>
        </div>
      </div>

      {/* Rendered email */}
      <div className="rounded-xl border border-brand-charcoal-border bg-brand-charcoal-base p-3">
        <div className="mb-3 flex items-start gap-2">
          <Eye size={14} className="mt-0.5 shrink-0 text-brand-muted-gold" />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.16em] text-brand-offwhite-muted">
              Subject
            </p>
            <p className="truncate text-sm font-bold text-brand-offwhite">
              {preview?.subject ?? "Rendering preview…"}
            </p>
          </div>
        </div>

        {visibleError ? (
          <div className="flex items-center gap-2 rounded-lg border border-brand-error/30 bg-brand-error/10 px-3 py-2.5 text-xs text-brand-error">
            <AlertCircle size={14} className="shrink-0" />
            <span>{visibleError}</span>
          </div>
        ) : (
          <div
            className={cn(
              "relative mx-auto overflow-hidden rounded-lg bg-white transition-[max-width] duration-300",
              viewport === "desktop" ? "max-w-[640px]" : "max-w-[390px]",
            )}
          >
            {preview ? (
              <iframe
                title="Email preview"
                srcDoc={preview.html}
                sandbox=""
                className="h-[680px] w-full border-0 bg-white"
              />
            ) : (
              <div className="flex h-[680px] items-center justify-center">
                <Activity
                  size={18}
                  className="animate-spin text-brand-charcoal-border"
                />
              </div>
            )}
            {loading && preview && (
              <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center bg-gradient-to-b from-brand-charcoal-base/80 to-transparent py-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-charcoal-base/90 px-2.5 py-1 text-[11px] text-brand-offwhite-muted">
                  <Activity size={12} className="animate-spin" />
                  Updating preview…
                </span>
              </div>
            )}
          </div>
        )}

        <p className="mt-3 text-[11px] text-brand-offwhite-muted/70">
          Preview only — nothing is sent and no email log is created. The logo
          is inlined so it renders exactly as delivered.
        </p>
      </div>
    </div>
  );
}
