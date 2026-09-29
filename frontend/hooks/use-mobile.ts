import * as React from "react"

const DEFAULT_MOBILE_BREAKPOINT = 768 // TopNav hamburger breakpoint; the workspace uses 900 (MOBILE_WORKSPACE_BREAKPOINT)

export function useIsMobile(breakpoint: number = DEFAULT_MOBILE_BREAKPOINT) {
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

