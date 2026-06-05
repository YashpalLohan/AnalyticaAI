import { TrendingUp } from 'lucide-react'
import type { KPIWidget } from '../../../services/dashboard.service'

interface Props {
  widget: KPIWidget
}

export default function KPICard({ widget }: Props) {
  return (
    <div className="bg-linen border border-border p-5 flex flex-col justify-between min-h-[110px]">
      <div className="flex items-start justify-between">
        <p className="label text-ink-faint">{widget.title}</p>
        <div className="w-8 h-8 border border-border flex items-center justify-center">
          <TrendingUp size={13} className="text-blue" />
        </div>
      </div>
      <p className="text-3xl font-black text-ink mt-2 tracking-tight leading-none">
        {widget.value}
      </p>
      <p className="text-[10px] text-ink-faint mt-1.5 uppercase tracking-wider">
        {widget.aggregation === 'count' ? 'total count' : widget.aggregation} · {widget.column}
      </p>
    </div>
  )
}
