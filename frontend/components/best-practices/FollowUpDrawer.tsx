"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useHasMounted } from "@/hooks/use-has-mounted";
import type { ChatMessage } from "./chat/types";
import { ChatHeader } from "./chat/ChatHeader";
import { ChatMessages } from "./chat/ChatMessages";
import { ChatComposer } from "./chat/ChatComposer";

const EASE = [0.32, 0.72, 0, 1] as const;

export function FollowUpDrawer({
  open,
  onClose,
  title,
  messages,
  loading,
  streaming,
  question,
  onQuestionChange,
  onSend,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  messages: ChatMessage[];
  loading: boolean;
  streaming: string | null;
  question: string;
  onQuestionChange: (q: string) => void;
  onSend: () => void;
}) {
  // Portals need a mounted client before document.body exists (SSR-safe).
  const mounted = useHasMounted();

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="followup-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-[2px]"
          />
          <motion.aside
            key="followup-drawer"
            data-followup-drawer
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.28, ease: EASE }}
            role="dialog"
            aria-modal="true"
            aria-label="AI follow-up chat"
            className="fixed inset-y-0 right-0 z-[100] flex w-full max-w-[420px] flex-col border-l border-border bg-brand-charcoal-panel shadow-2xl"
          >
            <ChatHeader title={title} onClose={onClose} />

            <ChatMessages
              messages={messages}
              streaming={streaming}
              loading={loading}
            />

            <ChatComposer
              question={question}
              onQuestionChange={onQuestionChange}
              onSend={onSend}
              loading={loading}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
