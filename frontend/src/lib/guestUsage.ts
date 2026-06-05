/**
 * Guest usage tracking.
 * Counts AI actions against a 3-use limit stored in localStorage.
 * Guest detection uses email pattern as the source of truth.
 */

const KEY   = 'guest_usage_count'
export const GUEST_LIMIT = 3

/** Detect guest by email pattern — more reliable than Zustand isGuest flag */
export function isGuestEmail(email: string | undefined): boolean {
  if (!email) return false
  return email.endsWith('@analytica.guest')
}

export function getGuestUsage(): number {
  return parseInt(localStorage.getItem(KEY) ?? '0', 10)
}

export function incrementGuestUsage(): void {
  localStorage.setItem(KEY, String(getGuestUsage() + 1))
}

export function isGuestLimitReached(): boolean {
  return getGuestUsage() >= GUEST_LIMIT
}

export function resetGuestUsage(): void {
  localStorage.removeItem(KEY)
}
