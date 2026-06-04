import { useState, useEffect } from 'react'
import { BarChart2, RefreshCw, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import edaService, { EDAResult, HeatmapData } from '../../services/eda.service'
import ChartGrid from './ChartGrid'
import StatisticsTable from './StatisticsTable'
import CorrelationHeatmap from './CorrelationHeatmap'

interface Props {
  datasetId: string
}

// ── Loading skeleton ───────────────────────────────────────────────────────

function EDASkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-px bg-border">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-linen p-4">
            <div className="h-3 w-16 bg-linen-dark mb-3" />
            <div className="h-6 w-12 bg-linen-dark" />
          </div>
        ))}
      </div>
      {/* Chart grid */}
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-linen border border-border h-64" />
        ))}
      </div>
      {/* Stats table */}
      <div className="bg-linen border border-border h-48" />
    </div>
  )
}

// ── KPI card ───────────────────────────────────────────────────────────────

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-linen border border-border p-4">
      <p className="label mb-1">{label}</p>
      <p className="text-2xl font-black text-ink">{value}</p>
    </div>
  )
}

// ── Section header ─────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <p className="label text-ink font-bold">{title}</p>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────────────────

export default function EDATab({ datasetId }: Props) {
  const [eda, setEda] = useState<EDAResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeSection, setActiveSection] = useState<'charts' | 'stats'>('charts')

  // Try to load cached EDA on mount
  useEffect(() => {
    edaService.getEDA(datasetId)
      .then(setEda)
      .catch(() => { /* 404 = not run yet, show empty state */ })
  }, [datasetId])

  const handleRun = async () => {
    setLoading(true)
    try {
      const result = await edaService.triggerEDA(datasetId)
      setEda(result)
      toast.success(`EDA complete — ${result.charts.length} charts generated.`)
    } catch (err: any) {
      const code = err?.response?.data?.detail?.code
      if (code === 'FILE_NOT_FOUND') {
        toast.error('Dataset file not found. Please re-upload the dataset.')
      } else if (code === 'DATASET_CORRUPTED') {
        toast.error('Could not read dataset file. Try re-uploading.')
      } else {
        toast.error('EDA failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Empty state ──
  if (!eda && !loading) {
    return (
      <div className="border border-border bg-linen p-16 text-center">
        <BarChart2 size={36} className="text-ink-faint mx-auto mb-4" />
        <p className="label-blue mb-2">Exploratory Data Analysis</p>
        <p className="font-bold text-sm uppercase tracking-wide text-ink mb-2">
          No EDA Yet
        </p>
        <p className="text-xs text-ink-faint max-w-sm mx-auto mb-6">
          Generate histograms, bar charts, a correlation heatmap, and
          summary statistics — all automatically from your dataset.
        </p>
        <button onClick={handleRun} className="btn-primary text-xs py-2.5 px-6">
          Generate EDA
        </button>
      </div>
    )
  }

  // ── Loading ──
  if (loading) {
    return <EDASkeleton />
  }

  // ── Results ──
  const nonHeatmapCharts = eda!.charts.filter(c => c.type !== 'heatmap')
  const heatmap = eda!.charts.find(c => c.type === 'heatmap')
  const shape = eda!.shape

  return (
    <div className="space-y-8">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="label-blue mb-1">Exploratory Data Analysis</p>
          <p className="text-xs text-ink-faint">
            {shape.numeric_columns} numeric · {shape.categorical_columns} categorical · {shape.rows.toLocaleString()} rows
          </p>
        </div>
        <button
          onClick={handleRun}
          disabled={loading}
          className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-4"
        >
          <RefreshCw size={12} />
          Regenerate
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
        <KpiCard label="Charts Generated"  value={eda!.charts.length} />
        <KpiCard label="Numeric Columns"   value={shape.numeric_columns} />
        <KpiCard label="Categorical Cols"  value={shape.categorical_columns} />
        <KpiCard label="Stat Rows"         value={eda!.statistics.length} />
      </div>

      {/* Section toggle */}
      <div className="flex gap-1 border-b border-border">
        {(['charts', 'stats'] as const).map(s => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors
              ${activeSection === s
                ? 'border-blue text-ink'
                : 'border-transparent text-ink-faint hover:text-ink'
              }`}
          >
            {s === 'charts' ? `Charts (${eda!.charts.length})` : `Statistics (${eda!.statistics.length} cols)`}
          </button>
        ))}
      </div>

      {/* Charts section */}
      {activeSection === 'charts' && (
        <div className="space-y-8">

          {/* Main chart grid (histograms + bar charts + scatter) */}
          {nonHeatmapCharts.length > 0 && (
            <div>
              <SectionHeader title="Distributions & Comparisons" />
              <ChartGrid charts={nonHeatmapCharts} />
            </div>
          )}

          {/* Correlation heatmap — full width */}
          {heatmap && heatmap.type === 'heatmap' && (
            <div>
              <SectionHeader title="Correlation Heatmap" />
              <div className="border border-border bg-linen p-5">
                <p className="text-xs text-ink-faint mb-4">
                  Pearson correlation coefficients between all numeric columns.
                  Values close to +1 (blue) or −1 (red) indicate strong correlation.
                </p>
                <div className="overflow-x-auto">
                  <CorrelationHeatmap data={heatmap as HeatmapData} />
                </div>
              </div>
            </div>
          )}

          {/* No charts fallback */}
          {nonHeatmapCharts.length === 0 && !heatmap && (
            <div className="border border-border bg-linen p-10 text-center">
              <TrendingUp size={28} className="text-ink-faint mx-auto mb-3" />
              <p className="text-xs text-ink-faint">
                No charts could be generated. The dataset may have no numeric or categorical columns.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Statistics section */}
      {activeSection === 'stats' && (
        <div>
          <SectionHeader title="Summary Statistics" />
          <StatisticsTable rows={eda!.statistics} />
        </div>
      )}
    </div>
  )
}
