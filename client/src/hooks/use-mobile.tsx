import * as React from "react"

// Mobile-first breakpoints
const BREAKPOINTS = {
  xs: 375,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS.md - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.md)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < BREAKPOINTS.md)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Enhanced mobile detection with device capabilities
export function useMobileDevice() {
  const [deviceInfo, setDeviceInfo] = React.useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isTouchDevice: false,
    screenSize: 'unknown' as keyof typeof BREAKPOINTS | 'unknown',
    orientation: 'unknown' as 'portrait' | 'landscape' | 'unknown',
    hasNotch: false,
    supportsHover: false,
  })

  React.useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const hasNotch = window.CSS?.supports('padding-top: env(safe-area-inset-top)')
      const supportsHover = window.matchMedia('(hover: hover)').matches

      let screenSize: keyof typeof BREAKPOINTS | 'unknown' = 'unknown'
      if (width >= BREAKPOINTS['2xl']) screenSize = '2xl'
      else if (width >= BREAKPOINTS.xl) screenSize = 'xl'
      else if (width >= BREAKPOINTS.lg) screenSize = 'lg'
      else if (width >= BREAKPOINTS.md) screenSize = 'md'
      else if (width >= BREAKPOINTS.sm) screenSize = 'sm'
      else if (width >= BREAKPOINTS.xs) screenSize = 'xs'

      setDeviceInfo({
        isMobile: width < BREAKPOINTS.md,
        isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg && isTouchDevice,
        isDesktop: width >= BREAKPOINTS.lg && !isTouchDevice,
        isTouchDevice,
        screenSize,
        orientation: height > width ? 'portrait' : 'landscape',
        hasNotch: hasNotch || false,
        supportsHover,
      })
    }

    // Initial check
    updateDeviceInfo()

    // Listen for resize and orientation changes
    const handleResize = () => updateDeviceInfo()
    const handleOrientationChange = () => {
      // Delay to ensure dimensions are updated after orientation change
      setTimeout(updateDeviceInfo, 100)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return deviceInfo
}

// Hook for responsive breakpoint detection
export function useBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = React.useState<keyof typeof BREAKPOINTS | 'xs'>('xs')

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      
      if (width >= BREAKPOINTS['2xl']) setCurrentBreakpoint('2xl')
      else if (width >= BREAKPOINTS.xl) setCurrentBreakpoint('xl')
      else if (width >= BREAKPOINTS.lg) setCurrentBreakpoint('lg')
      else if (width >= BREAKPOINTS.md) setCurrentBreakpoint('md')
      else if (width >= BREAKPOINTS.sm) setCurrentBreakpoint('sm')
      else setCurrentBreakpoint('xs')
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return {
    current: currentBreakpoint,
    isXs: currentBreakpoint === 'xs',
    isSm: currentBreakpoint === 'sm',
    isMd: currentBreakpoint === 'md',
    isLg: currentBreakpoint === 'lg',
    isXl: currentBreakpoint === 'xl',
    is2Xl: currentBreakpoint === '2xl',
    isMobile: ['xs', 'sm'].includes(currentBreakpoint),
    isTablet: currentBreakpoint === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(currentBreakpoint),
  }
}

// Hook for safe area insets (for devices with notches)
export function useSafeArea() {
  const [safeArea, setSafeArea] = React.useState({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  })

  React.useEffect(() => {
    const updateSafeArea = () => {
      const computedStyle = getComputedStyle(document.documentElement)
      
      setSafeArea({
        top: parseInt(computedStyle.getPropertyValue('--mobile-safe-area-top').replace('px', '')) || 0,
        bottom: parseInt(computedStyle.getPropertyValue('--mobile-safe-area-bottom').replace('px', '')) || 0,
        left: parseInt(computedStyle.getPropertyValue('--mobile-safe-area-left').replace('px', '')) || 0,
        right: parseInt(computedStyle.getPropertyValue('--mobile-safe-area-right').replace('px', '')) || 0,
      })
    }

    updateSafeArea()
    window.addEventListener('resize', updateSafeArea)
    window.addEventListener('orientationchange', () => {
      setTimeout(updateSafeArea, 100)
    })

    return () => {
      window.removeEventListener('resize', updateSafeArea)
      window.removeEventListener('orientationchange', updateSafeArea)
    }
  }, [])

  return safeArea
}
