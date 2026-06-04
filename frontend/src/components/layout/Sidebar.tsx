import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Database,
  MessageSquare,
  BarChart2,
  FileText,
  Settings,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home',      built: true  },
  { to: '/datasets',  icon: Database,         label: 'Datasets',  built: true  },
  { to: '/chat',      icon: MessageSquare,    label: 'Chat',      built: false },
  { to: '/analytics', icon: BarChart2,        label: 'Analytics', built: false },
  { to: '/reports',   icon: FileText,         label: 'Reports',   built: false },
]

export default function Sidebar() {
  const location = useLocation()

  // Treat /datasets/:id as active for the Datasets nav item
  const isDatasetActive = location.pathname.startsWith('/datasets')

  return (
    <aside className="w-[220px] bg-linen border-r border-border flex flex-col min-h-full">
      <nav className="flex-1 pt-4">
        {navItems.map(item => {
          const forceActive = item.to === '/datasets' && isDatasetActive

          if (!item.built) {
            return (
              <div
                key={item.to}
                className="flex items-center justify-between px-5 py-3 opacity-40 cursor-not-allowed select-none"
                title="Coming soon"
              >
                <div className="flex items-center gap-3 text-ink-faint">
                  <item.icon size={14} />
                  <span className="label">{item.label}</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-ink-faint border border-ink-faint/30 px-1.5 py-0.5 leading-none">
                  Soon
                </span>
              </div>
            )
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => {
                const active = isActive || forceActive
                return (
                  `flex items-center gap-3 px-5 py-3 transition-colors ` +
                  (active
                    ? 'bg-navy text-linen border-r-2 border-blue'
                    : 'text-ink-faint hover:text-ink hover:bg-linen-dark')
                )
              }}
            >
              <item.icon size={14} />
              <span className="label">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-border">
        <NavLink
          to="/settings"
          className={() =>
            'flex items-center justify-between px-5 py-3 opacity-40 cursor-not-allowed select-none'
          }
          title="Coming soon"
          onClick={e => e.preventDefault()}
        >
          <div className="flex items-center gap-3 text-ink-faint">
            <Settings size={14} />
            <span className="label">Settings</span>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-ink-faint border border-ink-faint/30 px-1.5 py-0.5 leading-none">
            Soon
          </span>
        </NavLink>
      </div>
    </aside>
  )
}
