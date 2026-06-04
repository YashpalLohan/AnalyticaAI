import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2, RefreshCw, BarChart2, Sparkles, LayoutDashboard, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import datasetService, { Dataset } from '../../services/dataset.service'
import profileService, { DatasetProfile } from '../../services/profile.service'
import OverviewTab from '../../features/profiling/OverviewTab'
import CleaningTab from '../../features/profiling/CleaningTab'

// ── Tab definitions ───────────────────────────────────────────────────────

type TabId = 'overview' | 'cleaning' | 'eda' | 'dashboard' | 'reports'

interface TabDef {
  id: TabId
  label: string
  icon: React.FC<{ size?: number; className?: string }>
  phase: number
  available: boolean
}

const TABS: TabDef[] = [
  { id: 'overview',   label: 'Overview',   icon: BarChart2,       phase: 2, available: true  },
  { id: 'cleaning',   label: 'Cleaning',   icon: Sparkles,        phase: 2, available: true  },
  { id: 'eda',        label: 'EDA',        icon: BarChart2,       phase: 3, available: false },
  { id: 'dashboard',  label: 'Dashboard',  icon: LayoutDashboard, phase: 5, available: false },
  { id: 'reports',    label: 'Reports',    icon: FileText,        phase: 6, available: false },
]

// ── Status badge ──────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  ready:     'text-success bg-success/10 border-success/30',
  uploaded:  'text-ink-faint bg-linen-dark border-border',
  profiling: 'text-warning bg-warning/10 border-warning/30',
  failed:    'text-error bg-error/10 border-error/30',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${STATUS_COLORS[status] ?? STATUS_COLORS.uploaded}`}>
      {status === 'profiling' && <Loader2 size={10} className="inline animate-spin mr-1" />}
      {status}
    </span>
  )
}

// ── Profiling skeleton ────────────────────────────────────────────────────

function ProfilingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-5 gap-px bg-border">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-linen p-4">
            <div className="h-3 w-16 bg-linen-dark mb-3" />
            <div className="h-8 w-20 bg-linen-dark" />
          </div>
        ))}
      </div>
      <div className="h-36 bg-linen border border-border" />
      <div className="h-64 bg-linen border border-border" />
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────

export default function DatasetWorkspacePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [profiling, setProfiling] = useState(false)
  const [profile, setProfile] = useState<DatasetProfile | null>(null)

  // Fetch dataset metadata
  const { data: dataset, isLoading: datasetLoading } = useQuery<Dataset>({
    queryKey: ['dataset', id],
    queryFn: () => datasetService.get(id!),
    enabled: !!id,
  })

  // Try to fetch existing profile on mount
  const { data: existingProfile, isLoading: profileLoading } = useQuery<DatasetProfile>({
    queryKey: ['profile', id],
    queryFn: () => profileService.getProfile(id!),
    enabled: !!id,
    retry: false,             // don't retry on 404
  })

  // Sync fetched profile into local state
  useEffect(() => {
    if (existingProfile) setProfile(existingProfile)
  }, [existingProfile])

  const handleTriggerProfile = async () => {
    if (!id) return
    setProfiling(true)
    try {
      const result = await profileService.triggerProfile(id)
      setProfile(result)
      // Refresh dataset status in the list
      queryClient.invalidateQueries({ queryKey: ['datasets'] })
      queryClient.invalidateQueries({ queryKey: ['dataset', id] })
      toast.success('Profiling complete.')
    } catch {
      toast.error('Profiling failed. Please try again.')
    } finally {
      setProfiling(false)
    }
  }

  const handleCleaned = (updated: DatasetProfile) => {
    setProfile(updated)
    queryClient.invalidateQueries({ queryKey: ['datasets'] })
    queryClient.invalidateQueries({ queryKey: ['dataset', id] })
  }

  if (datasetLoading) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-ink-faint" />
      </div>
    )
  }

  if (!dataset) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
        <p className="text-sm text-ink-faint">Dataset not found.</p>
        <button onClick={() => navigate('/datasets')} className="btn-secondary mt-4 text-xs">
          Back to Datasets
        </button>
      </div>
    )
  }

  const isProfileReady = !!profile && !profiling

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">

      {/* ── Breadcrumb / header ── */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/datasets')}
          className="flex items-center gap-1.5 text-xs text-ink-faint hover:text-ink transition-colors mb-4"
        >
          <ArrowLeft size={12} /> All Datasets
        </button>

        <div className="flex items-start justify-between border-b border-border pb-5">
          <div>
            <p className="label-blue mb-1">Dataset Workspace</p>
            <h1 className="text-2xl font-black uppercase tracking-tight text-ink">
              {dataset.name}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <StatusBadge status={dataset.status} />
              <span className="text-xs text-ink-faint font-mono">.{dataset.file_extension}</span>
              {dataset.total_rows != null && (
                <span className="text-xs text-ink-faint">
                  {dataset.total_rows.toLocaleString()} rows × {dataset.total_columns} cols
                </span>
              )}
            </div>
          </div>

          {/* Profile / re-profile button */}
          <button
            onClick={handleTriggerProfile}
            disabled={profiling}
            className="btn-primary flex items-center gap-2 text-xs py-2.5 px-5 disabled:opacity-60"
          >
            {profiling ? (
              <><Loader2 size={13} className="animate-spin" /> Profiling...</>
            ) : (
              <><RefreshCw size={13} /> {profile ? 'Re-profile' : 'Profile Dataset'}</>
            )}
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex border-b border-border mb-8 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => tab.available && setActiveTab(tab.id)}
            disabled={!tab.available}
            className={`flex items-center gap-1.5 px-5 py-3 text-xs font-bold uppercase tracking-wide border-b-2 transition-colors whitespace-nowrap
              ${activeTab === tab.id
                ? 'border-blue text-ink'
                : tab.available
                  ? 'border-transparent text-ink-faint hover:text-ink'
                  : 'border-transparent text-ink-faint/40 cursor-not-allowed'
              }`}
          >
            <tab.icon size={13} />
            {tab.label}
            {!tab.available && (
              <span className="text-[9px] font-bold text-ink-faint/50 ml-0.5">
                P{tab.phase}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <>
            {(profileLoading || profiling) && <ProfilingSkeleton />}
            {!profileLoading && !profiling && !profile && (
              <div className="border border-border bg-linen p-12 text-center">
                <BarChart2 size={32} className="text-ink-faint mx-auto mb-3" />
                <p className="font-bold text-sm uppercase tracking-wide text-ink mb-2">
                  No Profile Yet
                </p>
                <p className="text-xs text-ink-faint mb-6">
                  Click "Profile Dataset" to analyze this dataset and see health metrics, column statistics, and cleaning suggestions.
                </p>
                <button
                  onClick={handleTriggerProfile}
                  className="btn-primary text-xs py-2.5 px-6"
                >
                  Profile Dataset
                </button>
              </div>
            )}
            {isProfileReady && <OverviewTab profile={profile} />}
          </>
        )}

        {/* Cleaning */}
        {activeTab === 'cleaning' && (
          <>
            {(profileLoading || profiling) && <ProfilingSkeleton />}
            {!profileLoading && !profiling && !profile && (
              <div className="border border-border bg-linen p-12 text-center">
                <Sparkles size={32} className="text-ink-faint mx-auto mb-3" />
                <p className="font-bold text-sm uppercase tracking-wide text-ink mb-2">
                  Profile First
                </p>
                <p className="text-xs text-ink-faint mb-6">
                  Profile the dataset first to detect cleaning opportunities.
                </p>
                <button onClick={handleTriggerProfile} className="btn-primary text-xs py-2.5 px-6">
                  Profile Dataset
                </button>
              </div>
            )}
            {isProfileReady && (
              <CleaningTab profile={profile} onCleaned={handleCleaned} />
            )}
          </>
        )}

        {/* Future tabs */}
        {(activeTab === 'eda' || activeTab === 'dashboard' || activeTab === 'reports') && (
          <div className="border border-border bg-linen p-16 text-center">
            <p className="label-blue mb-3">
              Phase {TABS.find(t => t.id === activeTab)?.phase}
            </p>
            <p className="font-bold text-sm uppercase tracking-wide text-ink">
              {TABS.find(t => t.id === activeTab)?.label} — Coming Soon
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
