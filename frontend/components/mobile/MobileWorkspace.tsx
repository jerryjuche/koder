"use client";

import React, { useState, useEffect } from "react";
import { Problem, TestResult, ExecutionResult } from "@/lib/types";
import MobileTopHeader from "./MobileTopHeader";
import MobileBottomTabs, { MobileTab } from "./MobileBottomTabs";
import MobileFloatingActions from "./MobileFloatingActions";
import MobileProblemTab from "./tabs/MobileProblemTab";
import MobileCodeTab from "./tabs/MobileCodeTab";
import MobileOutputTab from "./tabs/MobileOutputTab";
import MobileHintsTab from "./tabs/MobileHintsTab";
import MobileMoreTab from "./tabs/MobileMoreTab";

interface MobileWorkspaceProps {
  problem: Problem;
  code: string;
  onCodeChange: (code: string) => void;
  onEditorMount: (editor: any, monaco: any) => void;
  getInitialValue: () => string;
  activeLanguage: string;
  availableLanguages: string[];
  onLanguageChange: (lang: string) => void;
  resetKey: number;
  saved: boolean;
  scaffoldAtToggle: string;
  handleFormat: () => void;
  handleReset: () => void;
  handleTest: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  submitting: boolean;
  cooldown: number;
  results: TestResult[] | null;
  lastExecution: ExecutionResult | null;
  errorMsg: string | null;
  hintsOpen: boolean[];
  setHintsOpen: React.Dispatch<React.SetStateAction<boolean[]>>;
  onOpenReport: () => void;
  onOpenEdit?: () => void;
  isAdmin: boolean;
  nextProblem: Problem | null;
  returnTo: string;
  editorRef: React.MutableRefObject<any>;
}

export default function MobileWorkspace({
  problem,
  code,
  onCodeChange,
  onEditorMount,
  getInitialValue,
  activeLanguage,
  availableLanguages,
  onLanguageChange,
  resetKey,
  saved,
  scaffoldAtToggle,
  handleFormat,
  handleReset,
  handleTest,
  handleSubmit,
  submitting,
  cooldown,
  results,
  lastExecution,
  errorMsg,
  hintsOpen,
  setHintsOpen,
  onOpenReport,
  onOpenEdit,
  isAdmin,
  nextProblem,
  returnTo,
  editorRef,
}: MobileWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<MobileTab>("problem");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Render-time state adjustment (react.dev/learn/you-might-not-need-an-effect):
  // if a run starts while the user is on another tab (e.g. the global Ctrl+Enter
  // shortcut), re-render directly on the Output tab instead of via an effect.
  const [lastSeenSubmitting, setLastSeenSubmitting] = useState(submitting);
  if (submitting !== lastSeenSubmitting) {
    setLastSeenSubmitting(submitting);
    if (submitting) {
      setActiveTab("output");
    }
  }

  // Synchronize Monaco editor layout when switching to the code tab
  useEffect(() => {
    if (activeTab === "code") {
      requestAnimationFrame(() => {
        editorRef.current?.layout();
      });
    }
  }, [activeTab, editorRef]);

  // Monitor mobile visual viewport to detect when software keyboard is open
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;
    const viewport = window.visualViewport;
    const handleViewportChange = () => {
      const keyboardActive = window.innerHeight - viewport.height > 150;
      setIsKeyboardOpen(keyboardActive);
    };
    viewport.addEventListener("resize", handleViewportChange);
    viewport.addEventListener("scroll", handleViewportChange);
    return () => {
      viewport.removeEventListener("resize", handleViewportChange);
      viewport.removeEventListener("scroll", handleViewportChange);
    };
  }, []);

  const handleMobileTest = async () => {
    setActiveTab("output");
    await handleTest();
  };

  const handleMobileSubmit = async () => {
    setActiveTab("output");
    await handleSubmit();
  };

  const hideBottomChrome = isKeyboardOpen && activeTab === "code";

  return (
    <div className="h-[100dvh] flex flex-col bg-brand-charcoal-base text-brand-offwhite overflow-hidden">
      {/* Top Header */}
      <MobileTopHeader
        problem={problem}
        returnTo={returnTo}
        nextProblem={nextProblem}
        isAdmin={isAdmin}
        onOpenEdit={onOpenEdit}
      />

      {/* Main Tab Content Area */}
      <main className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        {/* Tab 1: Problem Description */}
        {activeTab === "problem" && (
          <MobileProblemTab
            problem={problem}
            onStartCoding={() => setActiveTab("code")}
          />
        )}

        {/* Tab 2: Code Editor (Kept mounted to preserve Monaco model state & instant switching) */}
        <div
          className={
            activeTab === "code"
              ? "flex-1 flex flex-col min-h-0 h-full"
              : "hidden"
          }
        >
          <MobileCodeTab
            code={code}
            onCodeChange={onCodeChange}
            onEditorMount={onEditorMount}
            getInitialValue={getInitialValue}
            activeLanguage={activeLanguage}
            availableLanguages={availableLanguages}
            onLanguageChange={onLanguageChange}
            resetKey={resetKey}
            saved={saved}
            scaffoldAtToggle={scaffoldAtToggle}
            handleFormat={handleFormat}
            handleReset={handleReset}
            editorRef={editorRef}
          />
        </div>

        {/* Tab 3: Output / Test Results */}
        {activeTab === "output" && (
          <MobileOutputTab
            results={results}
            execution={lastExecution}
            errorMsg={errorMsg}
            submitting={submitting}
            onRunTest={handleMobileTest}
            cooldown={cooldown}
          />
        )}

        {/* Tab 4: Hints */}
        {activeTab === "hints" && (
          <MobileHintsTab
            hints={problem.hints}
            hintsOpen={hintsOpen}
            setHintsOpen={setHintsOpen}
          />
        )}

        {/* Tab 5: More Actions & Details */}
        {activeTab === "more" && (
          <MobileMoreTab
            problem={problem}
            nextProblem={nextProblem}
            returnTo={returnTo}
            handleReset={handleReset}
            onOpenReport={onOpenReport}
            onOpenEdit={onOpenEdit}
            isAdmin={isAdmin}
          />
        )}
      </main>

      {/* Floating Action Bar (Test & Submit) - hidden when keyboard is open while coding */}
      {!hideBottomChrome && (
        <MobileFloatingActions
          onTest={handleMobileTest}
          onSubmit={handleMobileSubmit}
          submitting={submitting}
          cooldown={cooldown}
          solved={problem.solved}
        />
      )}

      {/* Bottom Tabs Navigation - hidden when keyboard is open while coding */}
      {!hideBottomChrome && (
        <MobileBottomTabs
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          results={results}
          execution={lastExecution}
          errorMsg={errorMsg}
          hintsViewed={hintsOpen.filter(Boolean).length}
          submitting={submitting}
        />
      )}
    </div>
  );
}
