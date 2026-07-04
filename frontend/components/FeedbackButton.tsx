"use client";

import React, { useState, useRef } from "react";
import { MessageSquareText, X, Send, Camera, Bug, Lightbulb, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitFeedback } from "@/lib/api";
import { toast } from "@/lib/toast";
import { useUser } from "@/lib/UserContext";

const TABS = [
  { id: "general", label: "General", icon: MessageSquareText },
  { id: "bug", label: "Report Bug", icon: Bug },
  { id: "feature", label: "Feature Request", icon: Lightbulb },
] as const;

const PRIORITIES = ["low", "medium", "high"] as const;

export default function FeedbackButton() {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"general" | "bug" | "feature">("general");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Screenshot must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setScreenshot(result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    const res = await submitFeedback({
      type: tab,
      title: title.trim(),
      description: description.trim(),
      priority,
      screenshot_url: screenshot || undefined,
      is_anonymous: isAnonymous,
    });
    setSubmitting(false);

    if (res.success) {
      setSubmitted(true);
      toast.success("Thank you for your feedback!");
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setTitle("");
        setDescription("");
        setPriority("medium");
        setScreenshot(null);
        setIsAnonymous(false);
      }, 2000);
    } else {
      toast.error(res.error?.message || "Failed to submit feedback");
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSubmitted(false);
    setTitle("");
    setDescription("");
    setPriority("medium");
    setScreenshot(null);
    setIsAnonymous(false);
  };

  if (!user) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-brand-muted-gold px-4 py-3 text-sm font-semibold text-brand-charcoal-base shadow-lg transition-all duration-300 hover:bg-brand-muted-gold-dark hover:shadow-[0_0_24px_rgba(212,175,55,0.3)] hover:scale-105"
      >
        <MessageSquareText className="h-4 w-4" />
        <span className="hidden sm:inline">Feedback</span>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl border border-brand-charcoal-border bg-brand-charcoal-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-brand-charcoal-border px-5 py-4">
              <h2 className="text-lg font-bold text-brand-offwhite">Send Feedback</h2>
              <button onClick={handleClose} className="rounded-lg p-1 text-brand-offwhite-muted hover:bg-brand-charcoal-hover transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitted ? (
              <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-success/10">
                  <Send className="h-8 w-8 text-brand-success" />
                </div>
                <h3 className="text-xl font-bold text-brand-offwhite">Thank You!</h3>
                <p className="mt-2 text-sm text-brand-offwhite-muted">
                  Your feedback has been submitted successfully.
                </p>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="flex border-b border-brand-charcoal-border">
                  {TABS.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTab(t.id)}
                        className={cn(
                          "flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                          tab === t.id
                            ? "border-brand-muted-gold text-brand-muted-gold"
                            : "border-transparent text-brand-offwhite-muted hover:text-brand-offwhite",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                {/* Form */}
                <div className="space-y-4 px-5 py-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-brand-offwhite-muted uppercase tracking-wider">
                      Title <span className="text-brand-error">*</span>
                    </label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Brief summary of your feedback"
                      className="w-full rounded-lg border border-brand-charcoal-border bg-brand-charcoal-base px-4 py-2.5 text-sm text-brand-offwhite placeholder:text-brand-offwhite-muted/40 focus:outline-none focus:border-brand-muted-gold transition-colors"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-brand-offwhite-muted uppercase tracking-wider">
                      Description <span className="text-brand-error">*</span>
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your feedback in detail..."
                      rows={4}
                      className="w-full resize-none rounded-lg border border-brand-charcoal-border bg-brand-charcoal-base px-4 py-2.5 text-sm text-brand-offwhite placeholder:text-brand-offwhite-muted/40 focus:outline-none focus:border-brand-muted-gold transition-colors"
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="mb-1.5 block text-xs font-medium text-brand-offwhite-muted uppercase tracking-wider">
                        Priority
                      </label>
                      <div className="relative">
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value as "low" | "medium" | "high")}
                          className="w-full appearance-none rounded-lg border border-brand-charcoal-border bg-brand-charcoal-base px-4 py-2.5 pr-8 text-sm text-brand-offwhite focus:outline-none focus:border-brand-muted-gold transition-colors"
                        >
                          {PRIORITIES.map((p) => (
                            <option key={p} value={p}>
                              {p.charAt(0).toUpperCase() + p.slice(1)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-offwhite-muted" />
                      </div>
                    </div>

                    <div className="flex-1">
                      <label className="mb-1.5 block text-xs font-medium text-brand-offwhite-muted uppercase tracking-wider">
                        Screenshot
                      </label>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-brand-charcoal-border bg-brand-charcoal-base px-4 py-2.5 text-sm text-brand-offwhite-muted hover:border-brand-muted-gold/50 hover:text-brand-offwhite transition-colors"
                      >
                        <Camera className="h-4 w-4" />
                        {screenshot ? "Change" : "Attach"}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {screenshot && (
                    <div className="flex items-center justify-between rounded-lg border border-brand-charcoal-border bg-brand-charcoal-base px-3 py-2">
                      <span className="text-xs text-brand-offwhite-muted">Screenshot attached</span>
                      <button
                        onClick={() => setScreenshot(null)}
                        className="text-xs text-brand-error hover:text-brand-error/80 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="h-4 w-4 rounded border-brand-charcoal-border bg-brand-charcoal-base text-brand-muted-gold focus:ring-brand-muted-gold"
                    />
                    <span className="text-xs text-brand-offwhite-muted">Submit anonymously</span>
                  </label>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t border-brand-charcoal-border px-5 py-4">
                  <button
                    onClick={handleClose}
                    className="rounded-lg border border-brand-charcoal-border px-4 py-2 text-sm font-medium text-brand-offwhite-muted hover:bg-brand-charcoal-hover transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-muted-gold px-5 py-2 text-sm font-semibold text-brand-charcoal-base transition-all duration-300 hover:bg-brand-muted-gold-dark hover:shadow-[0_0_16px_rgba(212,175,55,0.25)] disabled:opacity-50"
                  >
                    {submitting ? (
                      <>Sending...</>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Feedback
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
