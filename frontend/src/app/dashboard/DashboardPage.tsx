import { useAuth } from '../../hooks/useAuth'
import { Upload, MessageSquare, BarChart2, FileText, LogOut, ChevronRight } from 'lucide-react'

const quickActions = [
  { tag: '01', icon: Upload,        label: 'Upload Dataset',  desc: 'CSV, XLSX, or JSON' },
  { tag: '02', icon: MessageSquare, label: 'Chat with Data',  desc: 'Ask anything' },
  { tag: '03', icon: BarChart2,     label: 'View Analytics',  desc: 'Auto-generated charts' },
  { tag: '04', icon: FileText,      label: 'Export Report',   desc: 'PDF or DOCX' },
]

const kpis = [
  { label: 'Datasets',      value: '0' },
  { label: 'Reports',       value: '0' },
  { label: 'Insights',      value: '0' },
  { label: 'Chat Sessions', value: '0' },
]

export default function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-linen flex flex-col">

      {/* ── Navbar ── */}
      <nav className="bg-linen border-b border-border sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-6 h-[60px] flex items-center justify-between">
          <span className="text-sm font-black uppercase tracking-widest text-ink">
            AnalyticaAI<span className="text-blue">.</span>
          </span>
          <div className="flex items-center gap-6">
            <span className="label text-ink-faint hidden sm:block">{user?.email}</span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 label hover:text-ink transition-colors"
            >
              <LogOut size={11} />
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-[1200px] mx-auto w-full px-6 py-12">

        {/* ── Page header ── */}
        <div className="mb-12 border-b border-border pb-10">
          <p className="label-blue mb-3">Dashboard</p>
          <h1 className="text-4xl font-black uppercase tracking-tight text-ink leading-none">
            Welcome,{' '}
            <span className="text-blue">
              {user?.full_name?.toUpperCase()}.
            </span>
          </h1>
        </div>

        {/* ── KPI row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border mb-12">
          {kpis.map(k => (
            <div key={k.label} className="bg-linen p-6 hover:bg-linen-dark transition-colors">
              <p className="label mb-2">{k.label}</p>
              <p className="text-4xl font-black text-ink">{k.value}</p>
            </div>
          ))}
        </div>

        {/* ── Quick actions ── */}
        <div className="mb-12">
          <p className="label mb-4">Quick Actions</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
            {quickActions.map(a => (
              <button
                key={a.tag}
                className="bg-linen p-6 text-left flex items-center justify-between
                           hover:bg-navy group transition-colors duration-100"
              >
                <div className="flex items-center gap-4">
                  {/* Icon box */}
                  <div className="w-10 h-10 border border-border
                                  flex items-center justify-center
                                  group-hover:border-border-dark transition-colors">
                    <a.icon
                      size={15}
                      className="text-ink-muted group-hover:text-blue transition-colors"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-ink
                                  group-hover:text-linen transition-colors">
                      {a.label}
                    </p>
                    <p className="text-xs text-ink-faint group-hover:text-linen/50
                                  transition-colors mt-0.5">
                      {a.desc}
                    </p>
                  </div>
                </div>
                <ChevronRight
                  size={13}
                  className="text-ink-faint group-hover:text-blue transition-colors"
                />
              </button>
            ))}
          </div>
        </div>

        {/* ── Empty state ── */}
        <div className="bg-grid border border-border p-12 text-center">
          <p className="label-blue mb-4">No data yet</p>
          <h3 className="text-2xl font-black uppercase tracking-tight text-ink mb-3">
            Upload your first dataset.
          </h3>
          <p className="text-sm text-ink-faint mb-8 max-w-sm mx-auto leading-relaxed">
            Upload a CSV file and AnalyticaAI will automatically profile,
            analyze, and visualize it within seconds.
          </p>
          <button className="btn-primary">
            Upload Dataset →
          </button>
        </div>

      </main>

    </div>
  )
}
