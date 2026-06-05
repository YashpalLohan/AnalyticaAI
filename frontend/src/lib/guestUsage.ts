/**
 * Guest usage tracking.
 * Counts AI actions (chat messages, dashboard gen, insight gen) against a 3-use limit.
 * Stored in localStorage so it persists across page refreshes.
 */

const KEY   = 'guest_usage_count'
const LIMIT = 3

export function getGuestUsage(): number {
  return parseInt(localStorage.getItem(KEY) ?? '0', 10)
}

export function incrementGuestUsage(): number {
  const next = getGuestUsage() + 1
  localStorage.setItem(KEY, String(next))
  return next
}

export function isGuestLimitReached(): boolean {
  return getGuestUsage() >= LIMIT
}

export function resetGuestUsage(): void {
  localStorage.removeItem(KEY)
}

export const GUEST_LIMIT = LIMIT
