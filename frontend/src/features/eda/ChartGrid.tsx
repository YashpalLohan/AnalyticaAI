import { memo, useRef, useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter, Legend,
} from 'recharts'
import type {
  AnyChart, HistogramChart, BarChart as BarChartType,
  LineChart as LineChartType, ScatterChart as ScatterChartType, HeatmapData,
} from '../../services/eda.service'
import ChartCard from './ChartCard'
import CorrelationHeatmap from './CorrelationHeatmap'

// ── Design tokens ─────────────────────────────────────────────────────────
const BLUE   = '#2563EB'
const BLUE_2 = '#60A5FA'
const BLUE_3 = '#93C5FD'
const PURPLE = '#7C3AED'
const GREEN  = '#16A34A'
const AMBER  = '#D97706'
const COLORS = [BLUE, PURPLE, GREEN, AMBER, BLUE_2, BLUE_3]

const AXIS_STYLE = { fontSize: 10, fill: '#6B7280', fontFamily: 'monospace' }
const TOOLTIP_STYLE = {
  backgroundColor: '#F0EEE9',
  border: '1px solid #DEDAD2',
  borderRadius: 0,
  fontSize: 11,
  fontWeight: 600,
}

// ── Helpers ────────────────────────────────────────────────────────────────

function shortLabel(s: string, max = 14): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

function fmtNum(val: number | null | undefined): string {
  if (val === null || val === undefined) return '—'
  if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (Math.abs(val) >= 1_000)     return `${(val / 1_000).toFixed(1)}K`
  return val.toFixed(2)
}

// ── Lazy mount: only render SVG when card enters viewport ─────────────────
// This prevents all 10 Recharts SVGs from being created at the same time,
// which is the main cause of the page freeze on chart load.

function LazyChart({ children, fullWidth }: { children: React.ReactNode; fullWidth?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // Use IntersectionObserver — fire once when at least 10% is visible
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }   // 100px lookahead
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={fullWidth ? 'col-span-2' : ''}>
      {visible
        ? children
        : (
          // Placeholder skeleton — same height as the chart, no SVG cost
          <div className="border border-border bg-linen animate-pulse">
            <div className="px-5 py-3.5 border-b border-border">
              <div className="h-3 w-32 bg-linen-dark" />
            </div>
            <div className="p-4 h-[232px] bg-linen-dark/30" />
          </div>
        )
      }
    </div>
  )
}

// ── Chart renderers — all memoized to prevent unnecessary re-renders ───────

const HistogramRenderer = memo(function HistogramRenderer({ chart }: { chart: HistogramChart }) {
  return (
    <ChartCard
      title={chart.title}
      subtitle={chart.stats
        ? `mean ${fmtNum(chart.stats.mean)} · median ${fmtNum(chart.stats.median)} · std ${fmtNum(chart.stats.std)}`
        : undefined}
    >
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chart.data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DEDAD2" vertical={false} />
          <XAxis
            dataKey="bin_start"
            tickFormatter={v => fmtNum(v)}
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={AXIS_STYLE} axisLine={false} tickLine={false} width={36} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(val: number) => [val, 'Count']}
            labelFormatter={(label) => `Range: ${label}`}
          />
          <Bar dataKey="count" fill={BLUE} radius={[2, 2, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
})

const BarRenderer = memo(function BarRenderer({ chart }: { chart: BarChartType }) {
  return (
    <ChartCard title={chart.title}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={chart.data}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#DEDAD2" horizontal={false} />
          <XAxis type="number" tick={AXIS_STYLE} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="category"
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            width={90}
            tickFormatter={v => shortLabel(String(v), 14)}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(val: number) => [val, 'Count']}
          />
          <Bar dataKey="count" fill={PURPLE} radius={[0, 2, 2, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
})

const LineRenderer = memo(function LineRenderer({ chart }: { chart: LineChartType }) {
  return (
    <ChartCard title={chart.title} fullWidth>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chart.data} margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DEDAD2" vertical={false} />
          <XAxis
            dataKey="date"
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => v?.slice(5) ?? v}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={fmtNum}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(val: number, name: string) => [fmtNum(val), name]}
          />
          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
          {chart.value_cols.map((col, i) => (
            <Line
              key={col}
              type="monotone"
              dataKey={col}
              stroke={COLORS[i % COLORS.length]}
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  )
})

const ScatterRenderer = memo(function ScatterRenderer({ chart }: { chart: ScatterChartType }) {
  return (
    <ChartCard title={chart.title} subtitle={`${chart.x_col} vs ${chart.y_col}`}>
      <ResponsiveContainer width="100%" height={200}>
        <ScatterChart margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#DEDAD2" />
          <XAxis
            dataKey="x"
            name={chart.x_col}
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            tickFormatter={fmtNum}
          />
          <YAxis
            dataKey="y"
            name={chart.y_col}
            tick={AXIS_STYLE}
            axisLine={false}
            tickLine={false}
            width={48}
            tickFormatter={fmtNum}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(val: number, name: string) => [fmtNum(val), name]}
            cursor={{ strokeDasharray: '3 3' }}
          />
          <Scatter data={chart.data} fill={GREEN} opacity={0.7} isAnimationActive={false} />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  )
})

const HeatmapRenderer = memo(function HeatmapRenderer({ chart }: { chart: HeatmapData }) {
  return (
    <ChartCard title={chart.title} fullWidth>
      <CorrelationHeatmap data={chart} />
    </ChartCard>
  )
})

// ── Dispatcher ─────────────────────────────────────────────────────────────

const AnyChartRenderer = memo(function AnyChartRenderer({ chart }: { chart: AnyChart }) {
  const fullWidth = chart.type === 'line' || chart.type === 'heatmap'

  const inner = (() => {
    switch (chart.type) {
      case 'histogram': return <HistogramRenderer chart={chart} />
      case 'bar':       return <BarRenderer chart={chart} />
      case 'line':      return <LineRenderer chart={chart} />
      case 'scatter':   return <ScatterRenderer chart={chart} />
      case 'heatmap':   return <HeatmapRenderer chart={chart} />
      default:          return null
    }
  })()

  if (!inner) return null

  return (
    <LazyChart fullWidth={fullWidth}>
      {inner}
    </LazyChart>
  )
})

// ── Grid ───────────────────────────────────────────────────────────────────

interface Props {
  charts: AnyChart[]
}

export default memo(function ChartGrid({ charts }: Props) {
  if (charts.length === 0) {
    return <p className="text-xs text-ink-faint text-center py-8">No charts generated.</p>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {charts.map((chart, i) => (
        <AnyChartRenderer key={`${chart.type}-${i}`} chart={chart} />
      ))}
    </div>
  )
})
