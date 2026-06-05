import { useState, useCallback } from 'react'
import { useAuthStore } from '../store/auth.store'
import { getGuestUsage, GUEST_LIMIT } from '../lib/guestUsage'

/**
 * Hook for enforcing the guest 3-action limit.
 *
 * Usage:
 *   const { checkLimit, showModal, closeModal, usageCount } = useGuestLimit()
 *
 *   const handleChat = async () => {
 *     if (!checkLimit()) return   // shows modal and blocks if limit reached
 *     // ... do the AI action
 *   }
 */
export function useGuestLimit() {
  const { isGuest } = useAuthStore()
  const [showModal, setShowModal] = useState(false)
  // Mirror localStorage count in React state so banner re-renders on change
  const [usageCount, setUsageCount] = useState<number>(() => getGuestUsage())

  /**
   * Returns true if the action is allowed (not a guest, or under limit).
   * Returns false and shows the modal if the limit is reached.
   * Increments the counter when allowed.
   */
  const checkLimit = useCallback((): boolean => {
    if (!isGuest) return true   // logged-in users: no limit

    const current = getGuestUsage()   // always read fresh from localStorage

    if (current >= GUEST_LIMIT) {
      setShowModal(true)
      return false
    }

    // Increment atomically
    const next = current + 1
    localStorage.setItem('guest_usage_count', String(next))
    setUsageCount(next)             // trigger re-render
    return true
  }, [isGuest])

  const closeModal = useCallback(() => setShowModal(false), [])

  const usageLeft = isGuest ? Math.max(0, GUEST_LIMIT - usageCount) : Infinity

  return { checkLimit, showModal, closeModal, usageCount, usageLeft }
}
