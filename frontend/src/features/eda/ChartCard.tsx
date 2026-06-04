import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
  children: ReactNode
  fullWidth?: boolean
}

export default function ChartCard({ title, subtitle, children, fullWidth = false }: Props) {
  return (
    <div className={`border border-border bg-linen flex flex-col ${fullWidth ? 'col-span-2' : ''}`}>
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-border">
        <p className="text-xs font-bold uppercase tracking-wide text-ink">{title}</p>
        {subtitle && <p className="text-[11px] text-ink-faint mt-0.5">{subtitle}</p>}
      </div>
      {/* Body */}
      <div className="p-4 flex-1">
        {children}
      </div>
    </div>
  )
}
