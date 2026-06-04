import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, X } from 'lucide-react'
import datasetService, { Dataset } from '../../services/dataset.service'
import UploadZone from '../../features/datasets/UploadZone'
import DatasetList from '../../features/datasets/DatasetList'

export default function DatasetsPage() {
  const [showUpload, setShowUpload] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => datasetService.list(),
  })

  const datasets = data?.datasets ?? []

  const handleUploaded = (_dataset: Dataset) => {
    queryClient.invalidateQueries({ queryKey: ['datasets'] })
    setShowUpload(false)
  }

  const handleDeleted = (id: string) => {
    queryClient.setQueryData(['datasets'], (old: any) => ({
      ...old,
      datasets: old.datasets.filter((d: Dataset) => d.id !== id),
      total: old.total - 1,
    }))
  }

  const handleRenamed = (id: string, name: string) => {
    queryClient.setQueryData(['datasets'], (old: any) => ({
      ...old,
      datasets: old.datasets.map((d: Dataset) => d.id === id ? { ...d, name } : d),
    }))
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-8 border-b border-border pb-6">
        <div>
          <p className="label-blue mb-1">Data Laboratory</p>
          <h1 className="text-2xl font-black uppercase tracking-tight text-ink">Datasets</h1>
        </div>
        <button
          className="btn-primary flex items-center gap-2 text-xs py-2.5 px-5"
          onClick={() => setShowUpload(!showUpload)}
        >
          {showUpload ? <><X size={13} /> Cancel</> : <><Plus size={13} /> Upload Dataset</>}
        </button>
      </div>

      {/* ── Upload panel ── */}
      {showUpload && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <p className="label">New Dataset</p>
          </div>
          <UploadZone onUploaded={handleUploaded} />
        </div>
      )}

      {/* ── Dataset list ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-linen p-5 animate-pulse">
              <div className="h-8 w-8 bg-linen-darker mb-4" />
              <div className="h-4 bg-linen-darker w-3/4 mb-3" />
              <div className="grid grid-cols-3 gap-2">
                <div className="h-6 bg-linen-darker" />
                <div className="h-6 bg-linen-darker" />
                <div className="h-6 bg-linen-darker" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DatasetList
          datasets={datasets}
          onDeleted={handleDeleted}
          onRenamed={handleRenamed}
          onSelect={d => navigate(`/datasets/${d.id}`)}
        />
      )}

      {/* ── Count ── */}
      {datasets.length > 0 && (
        <p className="label mt-4 text-right">{datasets.length} dataset{datasets.length !== 1 ? 's' : ''}</p>
      )}

    </div>
  )
}
