"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import LandingContent from "@/components/LandingContent";
import { fetchUser } from "@/lib/api";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";

const LOADER_DURATION = 1400;
const loadingStates = [
  { text: "Establishing secure connection..." },
  { text: "Verifying your session..." },
  { text: "Loading your workspace..." },
  { text: "Curating your dashboard..." },
  { text: "Ready" },
];

const TOTAL_LOAD_TIME = loadingStates.length * LOADER_DURATION;

export default function RootPage() {
  const router = useRouter();
  const startRef = useRef(0);
  const [phase, setPhase] = useState<"loader" | "landing" | "done">("loader");

  useEffect(() => {
    startRef.current = Date.now();

    const run = async () => {
      const res = await fetchUser();
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(TOTAL_LOAD_TIME - elapsed, 0);

      if (res.success && res.data) {
        await new Promise((r) => setTimeout(r, remaining));
        router.replace("/home");
        setPhase("done");
      } else {
        const minLanding = Math.max(2200 - elapsed, 400);
        await new Promise((r) => setTimeout(r, minLanding));
        setPhase("landing");
      }
    };

    run();
  }, [router]);

  return (
    <>
      <AnimatePresence mode="wait">
        {phase === "loader" && (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50"
          >
            <MultiStepLoader
              loadingStates={loadingStates}
              loading={true}
              duration={LOADER_DURATION}
              loop={false}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {phase === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <LandingContent />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
