import { useState, useCallback } from 'react'
import { useAuthStore } from '../store/auth.store'
import { isGuestEmail, isGuestLimitReached, incrementGuestUsage, getGuestUsage, GUEST_LIMIT } from '../lib/guestUsage'

export function useGuestLimit() {
  const { user } = useAuthStore()
  const isGuest = isGuestEmail(user?.email)   // email-based, always reliable
  const [showModal, setShowModal] = useState(false)
  const [, forceRender] = useState(0)

  const checkLimit = useCallback((): boolean => {
    if (!isGuest) return true

    if (isGuestLimitReached()) {
      setShowModal(true)
      return false
    }

    incrementGuestUsage()
    forceRender(n => n + 1)   // trigger re-render so banner updates
    return true
  }, [isGuest])

  const closeModal = useCallback(() => setShowModal(false), [])

  const usageCount = getGuestUsage()
  const usageLeft  = isGuest ? Math.max(0, GUEST_LIMIT - usageCount) : Infinity

  return { checkLimit, showModal, closeModal, usageCount, usageLeft, isGuest }
}
