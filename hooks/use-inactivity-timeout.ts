import { useEffect, useRef, useState } from 'react'

const INACTIVITY_TIMEOUT = 5 * 60 * 1000 // 5 minutes

export function useInactivityTimeout(onTimeout?: () => void) {
  const [isWarningOpen, setIsWarningOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const resetTimeout = () => {
    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
    setIsWarningOpen(false)

    // Set warning to appear after inactivity
    warningTimeoutRef.current = setTimeout(() => {
      setIsWarningOpen(true)
    }, INACTIVITY_TIMEOUT)
  }

  const handleDismiss = () => {
    setIsWarningOpen(false)
    resetTimeout()
  }

  const handleLogout = () => {
    setIsWarningOpen(false)
    if (onTimeout) {
      onTimeout()
    }
  }

  useEffect(() => {
    resetTimeout()

    // Track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click']

    const handleActivity = () => {
      resetTimeout()
    }

    events.forEach((event) => {
      document.addEventListener(event, handleActivity)
    })

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity)
      })
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current)
    }
  }, [])

  return { isWarningOpen, handleDismiss, handleLogout }
}
