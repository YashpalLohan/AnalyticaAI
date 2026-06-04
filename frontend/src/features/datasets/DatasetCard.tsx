import { useState } from 'react'
import { Trash2, FileText, MoreHorizontal, Pencil, Check, X } from 'lucide-react'
import { Dataset } from '../../services/dataset.service'
import datasetService from '../../services/dataset.service'
import toast from 'react-hot-toast'

interface Props {
  dataset: Dataset
  onDeleted: (id: string) => void
  onRenamed: (id: string, name: string) => void
  onClick: (dataset: Dataset) => void
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const statusColors: Record<string, string> = {
  ready:     'text-success',
  uploaded:  'text-ink-faint',
  profiling: 'text-warning',
  failed:    'text-error',
}

export default function DatasetCard({ dataset, onDeleted, onRenamed, onClick }: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [nameInput, setNameInput] = useState(dataset.name)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await datasetService.delete(dataset.id)
      onDeleted(dataset.id)
      toast.success('Dataset deleted')
    } catch {
      toast.error('Failed to delete dataset')
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleRename = async () => {
    if (!nameInput.trim() || nameInput.trim() === dataset.name) {
      setIsRenaming(false)
      return
    }
    try {
      await datasetService.rename(dataset.id, nameInput.trim())
      onRenamed(dataset.id, nameInput.trim())
      toast.success('Renamed')
    } catch {
      toast.error('Failed to rename')
      setNameInput(dataset.name)
    } finally {
      setIsRenaming(false)
    }
  }

  return (
    <div className="bg-linen border border-border hover:border-ink-muted transition-colors group relative">

      {/* Card body — clickable */}
      <button
        className="w-full p-5 text-left"
        onClick={() => onClick(dataset)}
      >
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-light border border-blue/20 flex items-center justify-center flex-shrink-0">
              <FileText size={14} className="text-blue" />
            </div>
            <span className="text-xs font-mono text-ink-faint uppercase">
              .{dataset.file_extension}
            </span>
          </div>
          <span className={`text-xs font-semibold uppercase tracking-wide ${statusColors[dataset.status] ?? 'text-ink-faint'}`}>
            {dataset.status}
          </span>
        </div>

        {/* Name */}
        {isRenaming ? (
          <div
            className="flex items-center gap-2 mb-4"
            onClick={e => e.stopPropagation()}
          >
            <input
              autoFocus
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setIsRenaming(false); setNameInput(dataset.name) } }}
              className="input text-sm py-1 flex-1"
            />
            <button onClick={handleRename} className="text-success hover:opacity-70"><Check size={14} /></button>
            <button onClick={() => { setIsRenaming(false); setNameInput(dataset.name) }} className="text-error hover:opacity-70"><X size={14} /></button>
          </div>
        ) : (
          <p className="font-bold text-sm uppercase tracking-wide text-ink mb-4 truncate">
            {dataset.name}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="label mb-0.5">Rows</p>
            <p className="text-sm font-bold text-ink">{dataset.total_rows?.toLocaleString() ?? '—'}</p>
          </div>
          <div>
            <p className="label mb-0.5">Cols</p>
            <p className="text-sm font-bold text-ink">{dataset.total_columns ?? '—'}</p>
          </div>
          <div>
            <p className="label mb-0.5">Size</p>
            <p className="text-sm font-bold text-ink">{formatBytes(dataset.file_size)}</p>
          </div>
        </div>
      </button>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border flex items-center justify-between">
        <p className="text-xs text-ink-faint">{formatDate(dataset.created_at)}</p>

        {/* Menu button */}
        <div className="relative">
          <button
            onClick={e => { e.stopPropagation(); setShowMenu(!showMenu) }}
            className="text-ink-faint hover:text-ink transition-colors p-1"
          >
            <MoreHorizontal size={14} />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 bottom-full mb-1 bg-linen border border-border shadow-flat-md z-10 min-w-[140px]"
              onClick={e => e.stopPropagation()}
            >
              <button
                className="w-full px-4 py-2.5 text-left text-xs font-medium text-ink hover:bg-linen-dark
                           flex items-center gap-2 transition-colors"
                onClick={() => { setIsRenaming(true); setShowMenu(false) }}
              >
                <Pencil size={12} /> Rename
              </button>
              <button
                className="w-full px-4 py-2.5 text-left text-xs font-medium text-error hover:bg-error-light
                           flex items-center gap-2 transition-colors"
                onClick={() => { setShowDeleteConfirm(true); setShowMenu(false) }}
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation overlay */}
      {showDeleteConfirm && (
        <div
          className="absolute inset-0 bg-linen/95 flex flex-col items-center justify-center p-6 z-20"
          onClick={e => e.stopPropagation()}
        >
          <p className="text-sm font-bold uppercase tracking-wide text-ink mb-2 text-center">
            Delete dataset?
          </p>
          <p className="text-xs text-ink-faint text-center mb-5">
            This cannot be undone. The file will be permanently removed.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="btn-secondary text-xs py-2 px-4"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-error text-white font-bold uppercase tracking-wide text-xs
                         px-4 py-2 hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
