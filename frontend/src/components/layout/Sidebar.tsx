import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Database, MessageSquare, BarChart2, FileText, Settings } from 'lucide-react'

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Home' },
  { to: '/datasets',   icon: Database,         label: 'Datasets' },
  { to: '/chat',       icon: MessageSquare,    label: 'Chat' },
  { to: '/analytics',  icon: BarChart2,        label: 'Analytics' },
  { to: '/reports',    icon: FileText,         label: 'Reports' },
]

export default function Sidebar() {
  return (
    <aside className="w-[220px] bg-linen border-r border-border flex flex-col min-h-full">
      <nav className="flex-1 pt-4">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 transition-colors
               ${isActive
                 ? 'bg-navy text-linen border-r-2 border-blue'
                 : 'text-ink-faint hover:text-ink hover:bg-linen-dark'
               }`
            }
          >
            <item.icon size={14} />
            <span className="label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-border">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-5 py-3 transition-colors
             ${isActive
               ? 'bg-navy text-linen'
               : 'text-ink-faint hover:text-ink hover:bg-linen-dark'
             }`
          }
        >
          <Settings size={14} />
          <span className="label">Settings</span>
        </NavLink>
      </div>
    </aside>
  )
}
