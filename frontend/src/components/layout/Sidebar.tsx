import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Database,
  MessageSquare,
  BarChart2,
  FileText,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home',      sub: 'Overview',          exact: true  },
  { to: '/datasets',  icon: Database,         label: 'Datasets',  sub: 'Upload & manage',   exact: false },
  { to: '/chat',      icon: MessageSquare,    label: 'Chat',      sub: 'Ask your data',     exact: true  },
  { to: '/analytics', icon: BarChart2,        label: 'Analytics', sub: 'EDA & dashboard',   exact: true  },
  { to: '/reports',   icon: FileText,         label: 'Reports',   sub: 'Insights & export', exact: true  },
]

const ACTIVE   = 'bg-navy text-linen border-r-2 border-blue'
const INACTIVE = 'text-ink-faint hover:text-ink hover:bg-linen-dark'

interface Props {
  onNavigate?: () => void
}

export default function Sidebar({ onNavigate }: Props) {
  const location = useLocation()

  return (
    <aside className="w-[220px] bg-linen border-r border-border flex flex-col h-full overflow-y-auto">
      <nav className="flex-1 pt-2">
        {navItems.map(item => {
          const isActive = item.exact
            ? location.pathname === item.to
            : location.pathname.startsWith(item.to)

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={() =>
                `flex items-center gap-3 px-4 py-3.5 transition-colors ${isActive ? ACTIVE : INACTIVE}`
              }
            >
              <item.icon size={15} className="flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest leading-none">
                  {item.label}
                </p>
                <p className="text-[10px] mt-0.5 normal-case tracking-normal font-normal truncate opacity-60">
                  {item.sub}
                </p>
              </div>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
