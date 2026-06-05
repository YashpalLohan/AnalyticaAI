import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { BarWidget } from '../../../services/dashboard.service'

const AXIS_STYLE  = { fontSize: 10, fill: '#6B7080', fontFamily: 'monospace' }
const TOOLTIP_STYLE = {
  backgroundColor: '#F0EEE9',
  border: '1px solid #DEDAD2',
  borderRadius: 0,
  fontSize: 11,
  fontWeight: 600,
}

function fmtNum(val: number | null | undefined): string {
  if (val == null) return '—'
  if (Math.abs(val) >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`
  if (Math.abs(val) >= 1_000)     return `${(val / 1_000).toFixed(1)}K`
  return val.toFixed(1)
}

function shortLabel(s: string, max = 12): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

interface Props {
  widget: BarWidget
}

export default function BarChartWidget({ widget }: Props) {
  return (
    <div className="bg-linen border border-border flex flex-col">
      <div className="px-5 py-3.5 border-b border-border">
        <p className="text-xs font-bold uppercase tracking-wide text-ink">{widget.title}</p>
        <p className="text-[11px] text-ink-faint mt-0.5">
          {widget.aggregation} of {widget.y_column} by {widget.x_column}
        </p>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={widget.data}
            layout="vertical"
            margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#DEDAD2" horizontal={false} />
            <XAxis
              type="number"
              tick={AXIS_STYLE}
              axisLine={false}
              tickLine={false}
              tickFormatter={fmtNum}
            />
            <YAxis
              type="category"
              dataKey="category"
              tick={AXIS_STYLE}
              axisLine={false}
              tickLine={false}
              width={90}
              tickFormatter={v => shortLabel(String(v))}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(val: number) => [fmtNum(val), widget.y_column]}
            />
            <Bar dataKey="value" fill="#4F6EF7" radius={[0, 2, 2, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
