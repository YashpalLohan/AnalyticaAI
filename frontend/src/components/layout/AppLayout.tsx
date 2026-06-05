import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import Sidebar from './Sidebar'
import GuestBanner from '../GuestBanner'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-linen flex flex-col">

      {/* ── Top navbar ── */}
      <nav className="bg-linen border-b border-border sticky top-0 z-50 h-[60px] flex items-center px-6 justify-between">
        <div className="flex items-center gap-3">
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-1 text-ink-faint hover:text-ink transition-colors"
            onClick={() => setSidebarOpen(prev => !prev)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span className="text-sm font-black uppercase tracking-widest text-ink">
            AnalyticaAI<span className="text-blue">.</span>
          </span>
        </div>

        <div className="flex items-center gap-5">
          <span className="label text-ink-faint hidden sm:block">{user?.email}</span>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 label hover:text-ink transition-colors"
          >
            <LogOut size={11} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </nav>

      {/* ── Guest banner ── */}
      <GuestBanner />

      {/* ── Body: sidebar + content ── */}
      <div className="flex flex-1 relative">

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-ink/40 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar — always visible on md+, drawer on mobile */}
        <div className={`
          fixed md:static top-[60px] left-0 h-[calc(100vh-60px)] z-40
          transition-transform duration-200
          md:translate-x-0 md:flex md:flex-col
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </div>

        <main className="flex-1 overflow-auto min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
