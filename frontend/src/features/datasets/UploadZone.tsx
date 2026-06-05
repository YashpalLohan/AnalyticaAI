import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import datasetService, { Dataset } from '../../services/dataset.service'
import { isGuestEmail, isGuestUploadLimitReached, recordGuestUpload } from '../../lib/guestUsage'
import { useAuthStore } from '../../store/auth.store'
import { Link } from 'react-router-dom'

interface Props {
  onUploaded: (dataset: Dataset) => void
}

type UploadState = 'idle' | 'uploading' | 'success' | 'error'

const ACCEPTED = { 'text/csv': ['.csv'], 'application/json': ['.json'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'] }

export default function UploadZone({ onUploaded }: Props) {
  const [state, setState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { user } = useAuthStore()
  const isGuest = isGuestEmail(user?.email)

  // Block upload before even trying if the guest has hit their lifetime upload limit
  if (isGuest && isGuestUploadLimitReached()) {
    return (
      <div className="border border-warning/40 bg-warning/5 p-8 text-center">
        <p className="font-bold uppercase tracking-wide text-ink text-sm mb-1">
          Guest upload limit reached
        </p>
        <p className="text-xs text-ink-faint mb-5">
          You've used all 3 free dataset uploads. Create a free account to upload unlimited datasets.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/register" className="btn-primary text-xs py-2 px-5">Create Account</Link>
          <Link to="/login"    className="btn-secondary text-xs py-2 px-5">Sign In</Link>
        </div>
      </div>
    )
  }

  const doUpload = async (file: File) => {
    setState('uploading')
    setProgress(0)
    setError('')
    try {
      const dataset = await datasetService.upload(file, pct => setProgress(pct))
      if (isGuest) recordGuestUpload(dataset.id)
      setState('success')
      onUploaded(dataset)
    } catch (err: any) {
      const msg = err?.response?.data?.detail?.message || 'Upload failed. Please try again.'
      setError(msg)
      setState('error')
    }
  }

  const onDrop = useCallback((accepted: File[], rejected: any[]) => {
    if (rejected.length > 0) {
      setError('Invalid file type. Only CSV, XLSX, and JSON are supported.')
      setState('error')
      return
    }
    if (accepted.length > 0) {
      setSelectedFile(accepted[0])
      doUpload(accepted[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxFiles: 1,
    disabled: state === 'uploading',
  })

  const reset = () => {
    setState('idle')
    setProgress(0)
    setError('')
    setSelectedFile(null)
  }

  // ── Success state ──
  if (state === 'success') {
    return (
      <div className="border border-border bg-linen-dark p-8 text-center">
        <CheckCircle className="mx-auto text-success mb-3" size={32} />
        <p className="font-bold uppercase tracking-wide text-ink text-sm mb-1">
          Upload complete
        </p>
        <p className="text-xs text-ink-faint mb-5">{selectedFile?.name}</p>
        <button onClick={reset} className="btn-secondary text-xs py-2 px-4">
          Upload another
        </button>
      </div>
    )
  }

  // ── Error state ──
  if (state === 'error') {
    return (
      <div className="border border-error bg-error-light p-8 text-center">
        <AlertCircle className="mx-auto text-error mb-3" size={32} />
        <p className="font-bold uppercase tracking-wide text-error text-sm mb-1">Upload failed</p>
        <p className="text-xs text-error/80 mb-5">{error}</p>
        <button onClick={reset} className="btn-primary text-xs py-2 px-4">
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-12 text-center cursor-pointer transition-colors
          ${isDragActive
            ? 'border-blue bg-blue-light'
            : 'border-border hover:border-ink-muted hover:bg-linen-dark'
          }
          ${state === 'uploading' ? 'pointer-events-none opacity-70' : ''}
        `}
      >
        <input {...getInputProps()} />

        {state === 'uploading' ? (
          <div className="space-y-4">
            <FileText className="mx-auto text-ink-faint" size={32} />
            <p className="text-sm font-bold uppercase tracking-wide text-ink">
              Uploading {selectedFile?.name}...
            </p>
            {/* Progress bar */}
            <div className="w-full bg-border h-1">
              <div
                className="bg-blue h-1 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-ink-faint">{progress}%</p>
          </div>
        ) : (
          <div className="space-y-3">
            <Upload className="mx-auto text-ink-faint" size={32} />
            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-ink">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your dataset'}
              </p>
              <p className="text-xs text-ink-faint mt-1">or click to browse</p>
            </div>
            <p className="text-xs text-ink-faint">CSV · XLSX · JSON · Max 100MB</p>
          </div>
        )}
      </div>
    </div>
  )
}
