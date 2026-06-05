import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { PieWidget } from '../../../services/dashboard.service'

const COLORS = ['#4F6EF7', '#7C3AED', '#1E8A52', '#C47A00', '#D94040', '#60A5FA', '#A78BFA', '#6EE7B7']

const TOOLTIP_STYLE = {
  backgroundColor: '#F0EEE9',
  border: '1px solid #DEDAD2',
  borderRadius: 0,
  fontSize: 11,
  fontWeight: 600,
}

interface Props {
  widget: PieWidget
}

export default function PieChartWidget({ widget }: Props) {
  const total = widget.data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="bg-linen border border-border flex flex-col">
      <div className="px-5 py-3.5 border-b border-border">
        <p className="text-xs font-bold uppercase tracking-wide text-ink">{widget.title}</p>
        <p className="text-[11px] text-ink-faint mt-0.5">
          {widget.data.length} categories · {total.toLocaleString()} total
        </p>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={widget.data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={80}
              isAnimationActive={false}
            >
              {widget.data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              formatter={(val: number, name: string) => [
                `${val.toLocaleString()} (${((val / total) * 100).toFixed(1)}%)`,
                name,
              ]}
            />
            <Legend
              wrapperStyle={{ fontSize: 10, paddingTop: 8 }}
              formatter={(value: string) =>
                value.length > 16 ? value.slice(0, 15) + '…' : value
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
