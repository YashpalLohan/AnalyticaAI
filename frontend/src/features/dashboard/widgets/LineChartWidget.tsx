import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { LineWidget } from '../../../services/dashboard.service'

const AXIS_STYLE = { fontSize: 10, fill: '#6B7080', fontFamily: 'monospace' }
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

interface Props {
  widget: LineWidget
}

export default function LineChartWidget({ widget }: Props) {
  return (
    <div className="bg-linen border border-border flex flex-col">
      <div className="px-5 py-3.5 border-b border-border">
        <p className="text-xs font-bold uppercase tracking-wide text-ink">{widget.title}</p>
        <p className="text-[11px] text-ink-faint mt-0.5">
          {widget.y_column} over {widget.x_column}
        </p>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={widget.data} margin={{ top: 4, right: 24, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DEDAD2" vertical={false} />
            <XAxis
              dataKey="date"
              tick={AXIS_STYLE}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => String(v).slice(5)}
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
              formatter={(val: number) => [fmtNum(val), widget.y_column]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#4F6EF7"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
