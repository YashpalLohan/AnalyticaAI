import { useState, useEffect } from 'react'
import { LayoutDashboard, RefreshCw, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import dashboardService, {
  Dashboard,
  DashboardWidget,
  KPIWidget,
  BarWidget,
  LineWidget,
  PieWidget,
} from '../../services/dashboard.service'
import KPICard from './widgets/KPICard'
import BarChartWidget from './widgets/BarChartWidget'
import LineChartWidget from './widgets/LineChartWidget'
import PieChartWidget from './widgets/PieChartWidget'

interface Props {
  datasetId: string
}

// ── Loading skeleton ───────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-linen p-5 min-h-[110px]">
            <div className="h-3 w-20 bg-linen-dark mb-4" />
            <div className="h-8 w-28 bg-linen-dark" />
          </div>
        ))}
      </div>
      {/* Chart row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-linen border border-border h-[290px]" />
        ))}
      </div>
    </div>
  )
}

// ── Widget dispatcher ──────────────────────────────────────────────────────

function WidgetRenderer({ widget }: { widget: DashboardWidget }) {
  switch (widget.type) {
    case 'kpi_card':   return <KPICard widget={widget as KPIWidget} />
    case 'bar_chart':  return <BarChartWidget widget={widget as BarWidget} />
    case 'line_chart': return <LineChartWidget widget={widget as LineWidget} />
    case 'pie_chart':  return <PieChartWidget widget={widget as PieWidget} />
    default:           return null
  }
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function DashboardTab({ datasetId }: Props) {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null)
  const [loading, setLoading] = useState(false)

  // Try to load cached dashboard on mount
  useEffect(() => {
    dashboardService.get(datasetId)
      .then(setDashboard)
      .catch(() => { /* 404 = not generated yet */ })
  }, [datasetId])

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const result = await dashboardService.generate(datasetId)
      setDashboard(result)
      toast.success(`Dashboard ready — ${result.widgets.length} widgets generated.`)
    } catch (err: any) {
      const msg = err?.response?.data?.detail?.message
      toast.error(msg || 'Dashboard generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Empty state ──
  if (!dashboard && !loading) {
    return (
      <div className="border border-border bg-linen p-16 text-center">
        <LayoutDashboard size={36} className="text-ink-faint mx-auto mb-4" />
        <p className="label-blue mb-2">AI Dashboard</p>
        <p className="font-bold text-sm uppercase tracking-wide text-ink mb-2">
          No Dashboard Yet
        </p>
        <p className="text-xs text-ink-faint max-w-sm mx-auto mb-6 leading-relaxed">
          The AI will analyze your dataset and automatically choose the best
          KPI cards and charts — no configuration needed.
        </p>
        <button onClick={handleGenerate} className="btn-primary text-xs py-2.5 px-6">
          <Sparkles size={13} />
          Generate Dashboard
        </button>
      </div>
    )
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-ink-faint">
          <div className="w-4 h-4 border-2 border-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-wide">
            AI is designing your dashboard…
          </p>
        </div>
        <DashboardSkeleton />
      </div>
    )
  }

  // ── Split widgets by type ──
  const kpis    = dashboard!.widgets.filter(w => w.type === 'kpi_card')
  const charts  = dashboard!.widgets.filter(w => w.type !== 'kpi_card')

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="label-blue mb-1">Auto-Generated Dashboard</p>
          <p className="text-xs text-ink-faint">
            {kpis.length} KPI card{kpis.length !== 1 ? 's' : ''} ·{' '}
            {charts.length} chart{charts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-4"
        >
          <RefreshCw size={12} />
          Regenerate
        </button>
      </div>

      {/* KPI cards row */}
      {kpis.length > 0 && (
        <div className={`grid gap-px bg-border grid-cols-1 ${
          kpis.length === 1 ? 'md:grid-cols-1' :
          kpis.length === 2 ? 'md:grid-cols-2' :
          'md:grid-cols-3'
        }`}>
          {kpis.map(w => (
            <WidgetRenderer key={w.id} widget={w} />
          ))}
        </div>
      )}

      {/* Charts grid */}
      {charts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {charts.map(w => (
            <WidgetRenderer key={w.id} widget={w} />
          ))}
        </div>
      )}

    </div>
  )
}
