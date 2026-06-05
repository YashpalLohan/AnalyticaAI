import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Upload, MessageSquare, BarChart2, FileText, ChevronRight, Database } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import datasetService from '../../services/dataset.service'

const quickActions = [
  { tag: '01', icon: Upload,        label: 'Upload Dataset',  desc: 'CSV, XLSX, or JSON',       to: '/datasets',  built: true },
  { tag: '02', icon: MessageSquare, label: 'Chat with Data',  desc: 'Ask anything',              to: '/chat',      built: true },
  { tag: '03', icon: BarChart2,     label: 'View Analytics',  desc: 'EDA & auto dashboard',      to: '/analytics', built: true },
  { tag: '04', icon: FileText,      label: 'Export Report',   desc: 'AI insights + PDF/DOCX',    to: '/reports',   built: true },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: datasetsData } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => datasetService.list(),
  })

  const datasetCount = datasetsData?.total ?? 0

  const kpis = [
    { label: 'Datasets',      value: datasetCount },
    { label: 'Reports',       value: 0 },
    { label: 'Insights',      value: 0 },
    { label: 'Chat Sessions', value: 0 },
  ]

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">

      {/* ── Header ── */}
      <div className="mb-10 border-b border-border pb-8">
        <p className="label-blue mb-2">Dashboard</p>
        <h1 className="text-3xl font-black uppercase tracking-tight text-ink leading-none">
          Welcome{user?.full_name ? <>, <span className="text-blue">{user.full_name.toUpperCase()}.</span></> : '.'} 
        </h1>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border mb-10">
        {kpis.map(k => (
          <div key={k.label} className="bg-linen p-6 hover:bg-linen-dark transition-colors">
            <p className="label mb-2">{k.label}</p>
            <p className="text-4xl font-black text-ink">{k.value}</p>
          </div>
        ))}
      </div>

      {/* ── Quick actions ── */}
      <div className="mb-10">
        <p className="label mb-3">Quick Actions</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
          {quickActions.map(a => (
            a.built ? (
              <button
                key={a.tag}
                onClick={() => navigate(a.to)}
                className="bg-linen p-5 text-left flex items-center justify-between
                           hover:bg-navy group transition-colors duration-100"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 border border-border flex items-center justify-center
                                  group-hover:border-border-dark transition-colors">
                    <a.icon size={14} className="text-ink-muted group-hover:text-blue transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-ink
                                  group-hover:text-linen transition-colors">{a.label}</p>
                    <p className="text-xs text-ink-faint group-hover:text-linen/50 transition-colors mt-0.5">{a.desc}</p>
                  </div>
                </div>
                <ChevronRight size={13} className="text-ink-faint group-hover:text-blue transition-colors" />
              </button>
            ) : (
              <div
                key={a.tag}
                className="bg-linen p-5 flex items-center justify-between opacity-40 cursor-not-allowed select-none"
                title="Coming soon"
              >
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 border border-border flex items-center justify-center">
                    <a.icon size={14} className="text-ink-muted" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-ink">{a.label}</p>
                    <p className="text-xs text-ink-faint mt-0.5">{a.desc}</p>
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-ink-faint border border-ink-faint/30 px-1.5 py-0.5 leading-none">
                  Soon
                </span>
              </div>
            )
          ))}
        </div>
      </div>

      {/* ── Recent datasets or empty state ── */}
      {datasetCount === 0 ? (
        <div className="bg-grid border border-border p-12 text-center">
          <Database className="mx-auto text-ink-faint mb-4" size={36} />
          <p className="label-blue mb-2">No data yet</p>
          <h3 className="text-xl font-black uppercase tracking-tight text-ink mb-3">
            Upload your first dataset.
          </h3>
          <p className="text-xs text-ink-faint mb-6 max-w-xs mx-auto leading-relaxed">
            Upload a CSV file to start getting AI-powered insights in under 60 seconds.
          </p>
          <button className="btn-primary" onClick={() => navigate('/datasets')}>
            Upload Dataset →
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="label">Recent Datasets</p>
            <button
              onClick={() => navigate('/datasets')}
              className="label-blue hover:opacity-70 transition-opacity"
            >
              View all →
            </button>
          </div>
          <div className="border border-border">
            {datasetsData?.datasets.slice(0, 3).map((d, i) => (
              <button
                key={d.id}
                onClick={() => navigate(`/datasets/${d.id}`)}
                className={`w-full px-5 py-4 flex items-center justify-between
                            hover:bg-linen-dark transition-colors text-left
                            ${i > 0 ? 'border-t border-border' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-ink-faint uppercase">.{d.file_extension}</span>
                  <span className="text-sm font-bold uppercase tracking-wide text-ink">{d.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-ink-faint">{d.total_rows?.toLocaleString()} rows</span>
                  <ChevronRight size={13} className="text-ink-faint" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
