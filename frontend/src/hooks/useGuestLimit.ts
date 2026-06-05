import { useState } from 'react'
import { useAuthStore } from '../store/auth.store'
import { isGuestLimitReached, incrementGuestUsage, getGuestUsage, GUEST_LIMIT } from '../lib/guestUsage'

/**
 * Hook for enforcing the guest 3-action limit.
 *
 * Usage:
 *   const { checkLimit, showModal, closeModal } = useGuestLimit()
 *
 *   const handleChat = async () => {
 *     if (!checkLimit()) return   // shows modal if limit reached
 *     // ... do the AI action
 *   }
 */
export function useGuestLimit() {
  const { isGuest } = useAuthStore()
  const [showModal, setShowModal] = useState(false)

  /**
   * Returns true if the action is allowed (not a guest, or under limit).
   * Returns false and shows the modal if the limit is reached.
   * Automatically increments the counter when allowed.
   */
  function checkLimit(): boolean {
    if (!isGuest) return true   // logged-in users have no limit

    if (isGuestLimitReached()) {
      setShowModal(true)
      return false
    }

    incrementGuestUsage()
    return true
  }

  function closeModal() {
    setShowModal(false)
  }

  const usageLeft = isGuest ? Math.max(0, GUEST_LIMIT - getGuestUsage()) : Infinity

  return { checkLimit, showModal, closeModal, usageLeft }
}
