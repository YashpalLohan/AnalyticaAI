/**
 * Guest usage tracking — stored in localStorage, persists across refreshes.
 *
 * Two separate limits:
 *  1. AI actions  (profile/EDA/chat/dashboard/insights) — max 3 total
 *  2. Dataset uploads — max 3 total, tracked by dataset ID so
 *     deleting a dataset and re-uploading still counts toward the limit.
 */

// ── Keys ───────────────────────────────────────────────────────────────────
const AI_KEY      = 'guest_usage_count'
const UPLOAD_KEY  = 'guest_uploaded_ids'   // JSON array of dataset IDs ever uploaded

export const GUEST_LIMIT          = 3
export const GUEST_DATASET_LIMIT  = 3

// ── Guest detection ────────────────────────────────────────────────────────

/** Detect guest by email — more reliable than Zustand isGuest flag */
export function isGuestEmail(email: string | undefined): boolean {
  return !!email && email.endsWith('@analytica.guest')
}

// ── AI action counter ──────────────────────────────────────────────────────

export function getGuestUsage(): number {
  return parseInt(localStorage.getItem(AI_KEY) ?? '0', 10)
}

export function incrementGuestUsage(): void {
  localStorage.setItem(AI_KEY, String(getGuestUsage() + 1))
}

export function isGuestLimitReached(): boolean {
  return getGuestUsage() >= GUEST_LIMIT
}

// ── Dataset upload counter (ID-based, deletion-proof) ─────────────────────

function getUploadedIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(UPLOAD_KEY) ?? '[]')
  } catch {
    return []
  }
}

/** Total unique datasets ever uploaded this guest session */
export function getGuestUploadCount(): number {
  return getUploadedIds().length
}

/** Record a newly uploaded dataset ID. Returns false if limit already reached. */
export function recordGuestUpload(datasetId: string): boolean {
  const ids = getUploadedIds()
  if (ids.length >= GUEST_DATASET_LIMIT) return false
  if (!ids.includes(datasetId)) {
    ids.push(datasetId)
    localStorage.setItem(UPLOAD_KEY, JSON.stringify(ids))
  }
  return true
}

/** Whether the guest has hit the upload limit (regardless of current dataset count) */
export function isGuestUploadLimitReached(): boolean {
  return getUploadedIds().length >= GUEST_DATASET_LIMIT
}

// ── Reset (called on sign-up/login) ───────────────────────────────────────

export function resetGuestUsage(): void {
  localStorage.removeItem(AI_KEY)
  localStorage.removeItem(UPLOAD_KEY)
}
