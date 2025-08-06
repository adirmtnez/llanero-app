import { useState, useEffect } from 'react'

export function useScreenSize(breakpoint: number = 1024) {
  const [isDesktop, setIsDesktop] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const checkScreenSize = () => {
      const desktop = window.innerWidth >= breakpoint
      setIsDesktop(desktop)
      setIsLoading(false)
    }

    // Check screen size on mount
    checkScreenSize()
    
    // Listen for window resize
    window.addEventListener('resize', checkScreenSize)
    
    return () => {
      window.removeEventListener('resize', checkScreenSize)
    }
  }, [breakpoint])

  return { isDesktop, isLoading }
}