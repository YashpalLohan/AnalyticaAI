import { Link } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useAuthStore } from '../store/auth.store'
import { getGuestUsage, GUEST_LIMIT } from '../lib/guestUsage'

export default function GuestBanner() {
  const { isGuest } = useAuthStore()

  if (!isGuest) return null

  const used = getGuestUsage()
  const left = Math.max(0, GUEST_LIMIT - used)

  return (
    <div className="bg-navy border-b border-border-dark px-6 py-2 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <p className="text-xs text-linen/70">
          Guest mode — data is session-only and won't sync across devices.
        </p>
        {/* Usage pips */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-linen/40">
            AI actions
          </span>
          {Array.from({ length: GUEST_LIMIT }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i < used ? 'bg-error' : 'bg-blue'
              }`}
            />
          ))}
          <span className="text-[10px] text-linen/50 ml-1">
            {left} left
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <Link
          to="/login"
          className="text-xs font-bold uppercase tracking-wide text-linen/70 hover:text-linen transition-colors"
        >
          Sign in
        </Link>
        <Link
          to="/register"
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide bg-blue text-white px-3 py-1.5 hover:bg-blue-hover transition-colors"
        >
          <UserPlus size={11} />
          Create Account
        </Link>
      </div>
    </div>
  )
}
