import * as React from "react"
import { MOBILE_WORKSPACE_BREAKPOINT } from "@/lib/mobile-workspace"

/**
 * Below this width the app renders its mobile shells.
 *
 * Sourced from `lib/mobile-workspace.ts` so the hook, the CSS `nav:` variant
 * (`--breakpoint-nav` in `app/globals.css`) and the mobile workspace all read
 * the same number. TopNav does NOT use this hook — it collapses to the
 * hamburger purely via the CSS `nav:` variant.
 */
export function useIsMobile(breakpoint: number = MOBILE_WORKSPACE_BREAKPOINT) {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(() => {
    return typeof window !== "undefined" ? window.innerWidth < breakpoint : undefined
  })

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }
    // Initial value comes from the lazy useState initializer above; the
    // media-query listener below keeps it in sync on breakpoint crossings.
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [breakpoint])

  return !!isMobile
}
