import { Link } from 'react-router-dom'
import { Lock, UserPlus, LogIn } from 'lucide-react'
import { GUEST_LIMIT } from '../lib/guestUsage'

interface Props {
  onClose?: () => void
}

export default function GuestLimitModal({ onClose }: Props) {
  return (
    // Backdrop
    <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-6">
      <div className="bg-linen border border-border max-w-md w-full shadow-flat-lg">

        {/* Header */}
        <div className="bg-navy px-6 py-5 border-b border-border-dark">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 border border-border-dark flex items-center justify-center">
              <Lock size={15} className="text-blue" />
            </div>
            <div>
              <p className="label text-linen/50 leading-none mb-1">Guest Limit Reached</p>
              <p className="text-sm font-black uppercase tracking-tight text-linen">
                Free trial used
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-sm text-ink mb-2 font-semibold">
            You've used all {GUEST_LIMIT} free AI actions.
          </p>
          <p className="text-xs text-ink-faint leading-relaxed mb-6">
            Create a free account to get unlimited access to AI chat, dashboards,
            insights, and report generation — no credit card required.
          </p>

          <div className="space-y-3">
            <Link
              to="/register"
              className="btn-primary w-full justify-center flex items-center gap-2 text-sm py-3"
            >
              <UserPlus size={14} />
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="btn-secondary w-full justify-center flex items-center gap-2 text-sm py-3"
            >
              <LogIn size={14} />
              Sign In
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-linen-dark">
          <p className="text-[10px] text-ink-faint text-center">
            Free account · No credit card · Unlimited AI actions
          </p>
        </div>

      </div>
    </div>
  )
}
