/**
 * DatasetPickerPage
 * A shared "pick a dataset to continue" page used by /chat, /analytics, /reports.
 * Clicking a dataset opens the workspace with the matching tab pre-selected.
 */
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Database } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import datasetService, { Dataset } from '../services/dataset.service'

interface Props {
  /** Tab to open when a dataset is selected — matches DatasetWorkspacePage TabId */
  tab: 'chat' | 'eda' | 'reports'
  label: string
  description: string
  icon: LucideIcon
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60)   return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)    return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(0)} KB`
}

export default function DatasetPickerPage({ tab, label, description, icon: Icon }: Props) {
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => datasetService.list(),
  })

  const datasets = data?.datasets ?? []

  const handlePick = (d: Dataset) => {
    navigate(`/datasets/${d.id}?tab=${tab}`)
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8 border-b border-border pb-6">
        <p className="label-blue mb-1">{label}</p>
        <h1 className="text-2xl font-black uppercase tracking-tight text-ink mb-2">
          Select a Dataset
        </h1>
        <p className="text-xs text-ink-faint">{description}</p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-px">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-linen animate-pulse h-16 border border-border" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && datasets.length === 0 && (
        <div className="border border-border bg-linen p-16 text-center">
          <Database size={32} className="text-ink-faint mx-auto mb-3" />
          <p className="font-bold text-sm uppercase tracking-wide text-ink mb-2">No Datasets Yet</p>
          <p className="text-xs text-ink-faint mb-6">
            Upload a CSV, XLSX, or JSON file first.
          </p>
          <button className="btn-primary text-xs py-2.5 px-6" onClick={() => navigate('/datasets')}>
            Upload Dataset →
          </button>
        </div>
      )}

      {/* Dataset list */}
      {!isLoading && datasets.length > 0 && (
        <div className="border border-border divide-y divide-border">
          {datasets.map(d => (
            <button
              key={d.id}
              onClick={() => handlePick(d)}
              className="w-full px-5 py-4 flex items-center justify-between hover:bg-linen-dark transition-colors text-left group"
            >
              <div className="flex items-center gap-4">
                {/* Icon */}
                <div className="w-9 h-9 border border-border flex items-center justify-center group-hover:border-blue transition-colors flex-shrink-0">
                  <Icon size={14} className="text-ink-muted group-hover:text-blue transition-colors" />
                </div>
                {/* Info */}
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-ink">
                    {d.name}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] font-mono text-ink-faint uppercase">.{d.file_extension}</span>
                    {d.total_rows != null && (
                      <span className="text-[10px] text-ink-faint">
                        {d.total_rows.toLocaleString()} rows
                      </span>
                    )}
                    <span className="text-[10px] text-ink-faint">{formatBytes(d.file_size)}</span>
                    <span className="text-[10px] text-ink-faint">{timeAgo(d.updated_at)}</span>
                  </div>
                </div>
              </div>
              {/* Status + arrow */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                  d.status === 'ready'
                    ? 'text-success bg-success/10 border-success/30'
                    : 'text-ink-faint bg-linen-dark border-border'
                }`}>
                  {d.status}
                </span>
                <ChevronRight size={13} className="text-ink-faint group-hover:text-blue transition-colors" />
              </div>
            </button>
          ))}
        </div>
      )}

      {datasets.length > 0 && (
        <p className="label mt-4 text-right">
          {datasets.length} dataset{datasets.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
