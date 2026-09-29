import { ExecutionResult, TestResult } from "@/lib/types";

/**
 * Layout breakpoint where Koder switches between the mobile workspace and the
 * desktop workspace. Keep the TopNav hamburger breakpoint in sync
 * (`max-nav:` / `nav:` variants map to this value in app/globals.css).
 */
export const MOBILE_WORKSPACE_BREAKPOINT = 900;

export interface MobileOutputState {
  hasResults: boolean;
  testsPassed: number;
  testsTotal: number;
  allPassed: boolean;
  hasError: boolean;
}

/**
 * Single source of truth for the Output tab's aggregate state, shared by
 * MobileBottomTabs (badge) and MobileOutputTab (banner) so the two can
 * never drift apart.
 */
export function deriveOutputState(
  results: TestResult[] | null,
  execution: ExecutionResult | null,
  errorMsg: string | null,
): MobileOutputState {
  const testsPassed = results?.filter((r) => r.passed).length ?? 0;
  const testsTotal = results?.length ?? 0;
  return {
    hasResults: !!results && results.length > 0,
    testsPassed,
    testsTotal,
    allPassed: testsTotal > 0 && testsPassed === testsTotal,
    hasError:
      execution?.status === "compiler_error" ||
      execution?.status === "timeout" ||
      Boolean(errorMsg),
  };
}
