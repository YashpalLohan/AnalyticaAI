import type { Insight } from '../../services/insights.service'

const TYPE_CONFIG = {
  trend:          { label: 'Trend',          border: 'border-l-blue',    badge: 'text-blue',    icon: '↗' },
  risk:           { label: 'Risk',           border: 'border-l-error',   badge: 'text-error',   icon: '⚠' },
  opportunity:    { label: 'Opportunity',    border: 'border-l-success', badge: 'text-success', icon: '◆' },
  recommendation: { label: 'Recommendation', border: 'border-l-[#7C3AED]', badge: 'text-[#7C3AED]', icon: '→' },
} as const

const SEVERITY_CONFIG = {
  high:   { label: 'High',   color: 'text-error   bg-error/10   border-error/30'   },
  medium: { label: 'Medium', color: 'text-warning bg-warning/10 border-warning/30' },
  low:    { label: 'Low',    color: 'text-success bg-success/10 border-success/30' },
} as const

interface Props {
  insight: Insight
}

export default function InsightCard({ insight }: Props) {
  const type = TYPE_CONFIG[insight.type] ?? TYPE_CONFIG.trend
  const sev  = SEVERITY_CONFIG[insight.severity] ?? SEVERITY_CONFIG.medium

  return (
    <div className={`bg-linen border border-border border-l-4 ${type.border} p-5`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-widest ${type.badge}`}>
            {type.icon} {type.label}
          </span>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${sev.color} whitespace-nowrap`}>
          {sev.label}
        </span>
      </div>
      <p className="text-sm font-bold uppercase tracking-wide text-ink mb-1.5">
        {insight.title}
      </p>
      <p className="text-xs text-ink-faint leading-relaxed">
        {insight.description}
      </p>
    </div>
  )
}
