import { Database } from 'lucide-react'
import { Dataset } from '../../services/dataset.service'
import DatasetCard from './DatasetCard'

interface Props {
  datasets: Dataset[]
  onDeleted: (id: string) => void
  onRenamed: (id: string, name: string) => void
  onSelect: (dataset: Dataset) => void
}

export default function DatasetList({ datasets, onDeleted, onRenamed, onSelect }: Props) {
  if (datasets.length === 0) {
    return (
      <div className="bg-grid border border-border p-16 text-center">
        <Database className="mx-auto text-ink-faint mb-4" size={36} />
        <p className="label-blue mb-2">No datasets yet</p>
        <p className="text-sm font-bold uppercase tracking-wide text-ink mb-1">
          Upload your first dataset.
        </p>
        <p className="text-xs text-ink-faint max-w-xs mx-auto">
          Upload a CSV, XLSX, or JSON file to start analyzing your data.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
      {datasets.map(d => (
        <DatasetCard
          key={d.id}
          dataset={d}
          onDeleted={onDeleted}
          onRenamed={onRenamed}
          onClick={onSelect}
        />
      ))}
      {/* Fill empty cells so the last row doesn't show bg-border ghost columns */}
      {datasets.length % 3 === 1 && (
        <>
          <div className="bg-linen hidden lg:block" />
          <div className="bg-linen hidden lg:block" />
        </>
      )}
      {datasets.length % 3 === 2 && (
        <div className="bg-linen hidden lg:block" />
      )}
    </div>
  )
}
