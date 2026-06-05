import { Link } from 'react-router-dom'
import { UserPlus } from 'lucide-react'
import { useAuthStore } from '../store/auth.store'

export default function GuestBanner() {
  const { isGuest } = useAuthStore()

  if (!isGuest) return null

  return (
    <div className="bg-navy border-b border-border-dark px-6 py-2 flex items-center justify-between gap-4">
      <p className="text-xs text-linen/70">
        You're using AnalyticaAI as a guest. Your data is stored locally and won't sync across devices.
      </p>
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
