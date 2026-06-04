import { Outlet } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Sidebar from './Sidebar'

export default function AppLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-linen flex flex-col">

      {/* ── Top navbar ── */}
      <nav className="bg-linen border-b border-border sticky top-0 z-50 h-[60px] flex items-center px-6 justify-between">
        <span className="text-sm font-black uppercase tracking-widest text-ink">
          AnalyticaAI<span className="text-blue">.</span>
        </span>
        <div className="flex items-center gap-5">
          <span className="label text-ink-faint hidden sm:block">{user?.email}</span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 label hover:text-ink transition-colors"
          >
            <LogOut size={11} />
            Sign out
          </button>
        </div>
      </nav>

      {/* ── Body: sidebar + content ── */}
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

    </div>
  )
}
