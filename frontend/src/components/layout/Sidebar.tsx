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
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home',      sub: 'Overview',         built: true  },
  { to: '/datasets',  icon: Database,         label: 'Datasets',  sub: 'Upload & manage',  built: true  },
  { to: '/datasets',  icon: MessageSquare,    label: 'Chat',      sub: 'Ask your data',    built: true  },
  { to: '/datasets',  icon: BarChart2,        label: 'Analytics', sub: 'EDA & dashboard',  built: true  },
  { to: '/datasets',  icon: FileText,         label: 'Reports',   sub: 'Insights & export',built: true  },
]

export default function Sidebar() {
  const location = useLocation()
  const isDatasetActive = location.pathname.startsWith('/datasets')

  return (
    <aside className="w-[220px] bg-linen border-r border-border flex flex-col min-h-full">
      <nav className="flex-1 pt-4">
        {navItems.map((item, idx) => {
          // For the Datasets group (indices 1-4), only the first one (Datasets)
          // gets the active highlight — the others just navigate there without highlight
          const forceActive = item.to === '/datasets' && idx === 1 && isDatasetActive

          return (
            <NavLink
              key={`${item.to}-${idx}`}
              to={item.to}
              className={({ isActive }) => {
                const active = (item.to === '/dashboard' && isActive) || forceActive
                return (
                  `flex items-center gap-3 px-5 py-3 transition-colors ` +
                  (active
                    ? 'bg-navy text-linen border-r-2 border-blue'
                    : 'text-ink-faint hover:text-ink hover:bg-linen-dark')
                )
              }}
            >
              <item.icon size={14} className="flex-shrink-0" />
              <div className="min-w-0">
                <p className="label leading-none">{item.label}</p>
                <p className="text-[10px] text-ink-faint/70 mt-0.5 normal-case tracking-normal font-normal truncate">
                  {item.sub}
                </p>
              </div>
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-border">
        <div
          className="flex items-center justify-between px-5 py-3 opacity-40 cursor-not-allowed select-none"
          title="Coming in Phase 7"
        >
          <div className="flex items-center gap-3 text-ink-faint">
            <Settings size={14} />
            <div>
              <p className="label leading-none">Settings</p>
              <p className="text-[10px] text-ink-faint/70 mt-0.5 normal-case tracking-normal font-normal">
                Phase 7
              </p>
            </div>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-ink-faint border border-ink-faint/30 px-1.5 py-0.5 leading-none">
            Soon
          </span>
        </div>
      </div>
    </aside>
  )
}
