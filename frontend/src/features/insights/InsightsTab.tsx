import { useState, useEffect, useRef } from 'react'
import { Sparkles, RefreshCw, FileText, FileDown, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import insightsService, { InsightsResult } from '../../services/insights.service'
import InsightCard from './InsightCard'
import GuestLimitModal from '../../components/GuestLimitModal'
import { useGuestLimit } from '../../hooks/useGuestLimit'

interface Props {
  datasetId: string
  datasetName?: string
}

// ── Skeleton ──────────────────────────────────────────────────────────────

function InsightsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Summary block */}
      <div className="bg-linen border border-border p-5">
        <div className="h-3 w-32 bg-linen-dark mb-3" />
        <div className="h-3 w-full bg-linen-dark mb-2" />
        <div className="h-3 w-3/4 bg-linen-dark" />
      </div>
      {/* Cards */}
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-linen border border-border border-l-4 border-l-linen-dark p-5">
          <div className="h-3 w-16 bg-linen-dark mb-3" />
          <div className="h-4 w-48 bg-linen-dark mb-2" />
          <div className="h-3 w-full bg-linen-dark" />
        </div>
      ))}
    </div>
  )
}

// ── Download helper ────────────────────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a   = document.createElement('a')
  a.href     = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ── Main ──────────────────────────────────────────────────────────────────

export default function InsightsTab({ datasetId, datasetName = 'dataset' }: Props) {
  const [result, setResult]           = useState<InsightsResult | null>(null)
  const [loading, setLoading]         = useState(false)
  const [pdfLoading, setPdfLoading]   = useState(false)
  const [docxLoading, setDocxLoading] = useState(false)
  const { checkLimit, showModal, closeModal } = useGuestLimit()
  const hasFetched = useRef(false)

  // Load cached insights on mount — only once
  useEffect(() => {
    if (hasFetched.current) return
    hasFetched.current = true
    insightsService.get(datasetId)
      .then(setResult)
      .catch(() => { /* 404 = not generated yet */ })
  }, [datasetId])

  const handleGenerate = async () => {
    if (!checkLimit()) return
    setLoading(true)
    try {
      const data = await insightsService.generate(datasetId)
      setResult(data)
      toast.success(`${data.insights.length} insights generated.`)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail?.message || 'Insight generation failed.')
    } finally {
      setLoading(false)
    }
  }

  const handlePDF = async () => {
    setPdfLoading(true)
    try {
      const blob = await insightsService.downloadPDF(datasetId)
      triggerDownload(blob, `${datasetName.replace(/\s+/g, '_')}_report.pdf`)
      toast.success('PDF report downloaded.')
    } catch {
      toast.error('PDF generation failed. Please try again.')
    } finally {
      setPdfLoading(false)
    }
  }

  const handleDOCX = async () => {
    setDocxLoading(true)
    try {
      const blob = await insightsService.downloadDOCX(datasetId)
      triggerDownload(blob, `${datasetName.replace(/\s+/g, '_')}_report.docx`)
      toast.success('DOCX report downloaded.')
    } catch {
      toast.error('DOCX generation failed. Please try again.')
    } finally {
      setDocxLoading(false)
    }
  }

  // ── Empty state ──
  if (!result && !loading) {
    return (
      <>
        {showModal && <GuestLimitModal onClose={closeModal} />}
        <div className="border border-border bg-linen p-16 text-center">
          <Sparkles size={36} className="text-ink-faint mx-auto mb-4" />
          <p className="label-blue mb-2">AI Insights</p>
          <p className="font-bold text-sm uppercase tracking-wide text-ink mb-2">
            No Insights Yet
          </p>
          <p className="text-xs text-ink-faint max-w-sm mx-auto mb-6 leading-relaxed">
            The AI will analyze your dataset and surface trends, risks,
            opportunities, and recommendations with specific numbers.
          </p>
          <button onClick={handleGenerate} className="btn-primary text-xs py-2.5 px-6">
            <Sparkles size={13} />
            Generate Insights
          </button>
        </div>
      </>
    )
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 text-ink-faint">
          <div className="w-4 h-4 border-2 border-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold uppercase tracking-wide">
            AI is analyzing your data…
          </p>
        </div>
        <InsightsSkeleton />
      </div>
    )
  }

  const byType = {
    trend:          result!.insights.filter(i => i.type === 'trend').length,
    risk:           result!.insights.filter(i => i.type === 'risk').length,
    opportunity:    result!.insights.filter(i => i.type === 'opportunity').length,
    recommendation: result!.insights.filter(i => i.type === 'recommendation').length,
  }

  return (
    <div className="space-y-8">
      {showModal && <GuestLimitModal onClose={closeModal} />}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label-blue mb-1">AI-Generated Insights</p>
          <p className="text-xs text-ink-faint">
            {result!.insights.length} insights ·{' '}
            {byType.trend > 0    && `${byType.trend} trend${byType.trend > 1 ? 's' : ''} · `}
            {byType.risk > 0     && `${byType.risk} risk${byType.risk > 1 ? 's' : ''} · `}
            {byType.opportunity > 0 && `${byType.opportunity} opportunit${byType.opportunity > 1 ? 'ies' : 'y'} · `}
            {byType.recommendation > 0 && `${byType.recommendation} recommendation${byType.recommendation > 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-3"
          >
            <RefreshCw size={12} />
            Regenerate
          </button>
          <button
            onClick={handlePDF}
            disabled={pdfLoading}
            className="btn-primary flex items-center gap-1.5 text-xs py-2 px-4"
          >
            {pdfLoading
              ? <Loader2 size={12} className="animate-spin" />
              : <FileDown size={12} />
            }
            PDF
          </button>
          <button
            onClick={handleDOCX}
            disabled={docxLoading}
            className="btn-secondary flex items-center gap-1.5 text-xs py-2 px-4"
          >
            {docxLoading
              ? <Loader2 size={12} className="animate-spin" />
              : <FileText size={12} />
            }
            DOCX
          </button>
        </div>
      </div>

      {/* Executive summary */}
      {result!.executive_summary && (
        <div className="bg-navy text-linen p-5 border border-border-dark">
          <p className="label text-linen/50 mb-2">Executive Summary</p>
          <p className="text-sm leading-relaxed text-linen/90">
            {result!.executive_summary}
          </p>
        </div>
      )}

      {/* Insight cards */}
      <div className="space-y-3">
        {result!.insights.map((insight, i) => (
          <InsightCard key={i} insight={insight} />
        ))}
      </div>

    </div>
  )
}
