
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    // Initialize with a stable value on first render
    if (typeof window === 'undefined') return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  })

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      const newIsMobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(prev => {
        // Only update if the value actually changed to prevent unnecessary re-renders
        if (prev !== newIsMobile) {
          return newIsMobile;
        }
        return prev;
      });
    }
    
    mql.addEventListener("change", onChange)
    
    // Set initial value but only if it's different
    const initialValue = window.innerWidth < MOBILE_BREAKPOINT;
    setIsMobile(prev => prev !== initialValue ? initialValue : prev);
    
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return isMobile
}
