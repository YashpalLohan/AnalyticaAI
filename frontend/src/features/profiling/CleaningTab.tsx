import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { DatasetProfile, CleaningSuggestion, CleaningFix } from '../../services/profile.service'
import profileService from '../../services/profile.service'

interface Props {
  profile: DatasetProfile
  onCleaned: (updated: DatasetProfile) => void
}

// ── Severity badge ────────────────────────────────────────────────────────

const SEVERITY_STYLES: Record<string, string> = {
  high:   'bg-error/10 text-error border-error/30',
  medium: 'bg-warning/10 text-warning border-warning/30',
  low:    'bg-blue-light text-blue border-blue/30',
}

const SEVERITY_DOT: Record<string, string> = {
  high:   'bg-error',
  medium: 'bg-warning',
  low:    'bg-blue',
}

// ── Fix label map ─────────────────────────────────────────────────────────

const FIX_LABELS: Record<string, string> = {
  drop_duplicates:        'Remove duplicate rows',
  fill_median:            'Fill with median (coerces mixed values)',
  fill_mode:              'Fill with most frequent',
  drop_column:            'Drop entire column',
  abs_value:              'Convert to absolute value (remove sign)',
  standardize_categories: 'Strip spaces + title-case all values',
  standardize_dates:      'Parse & reformat to YYYY-MM-DD',
  manual_review:          'Requires manual review',
}

// Fixes that can be auto-applied via the API
const AUTO_FIXABLE = new Set([
  'drop_duplicates',
  'fill_median',
  'fill_mode',
  'drop_column',
  'abs_value',
  'standardize_categories',
  'standardize_dates',
])

// ── Dimension badge ───────────────────────────────────────────────────────

const DIM_COLORS: Record<string, string> = {
  completeness: 'bg-blue-light text-blue border-blue/20',
  validity:     'bg-purple-50 text-purple-700 border-purple-200',
  uniqueness:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  consistency:  'bg-green-50 text-green-700 border-green-200',
}

// ── Score delta preview ───────────────────────────────────────────────────

function ScoreDelta({ before, after }: { before: number; after: number }) {
  const delta = after - before
  if (delta === 0) return null
  const color = delta > 0 ? 'text-success' : 'text-error'
  return (
    <span className={`text-xs font-bold ${color}`}>
      {delta > 0 ? '+' : ''}{delta.toFixed(1)} pts
    </span>
  )
}

// ── Individual suggestion card ────────────────────────────────────────────

interface SuggestionCardProps {
  suggestion: CleaningSuggestion
  selected: boolean
  onToggle: () => void
}

function SuggestionCard({ suggestion, selected, onToggle }: SuggestionCardProps) {
  const severity = suggestion.severity
  const isAutoFixable = AUTO_FIXABLE.has(suggestion.fix)
  const dimColor = suggestion.dimension ? DIM_COLORS[suggestion.dimension] : ''

  return (
    <div
      className={`border p-4 transition-all ${
        selected
          ? 'border-blue bg-blue-light/30'
          : `${SEVERITY_STYLES[severity] ?? SEVERITY_STYLES.low} bg-linen`
      } ${!isAutoFixable ? 'opacity-75' : ''}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox — disabled for non-auto-fixable items */}
        <button
          onClick={isAutoFixable ? onToggle : undefined}
          disabled={!isAutoFixable}
          className={`mt-0.5 w-4 h-4 flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
            !isAutoFixable
              ? 'border-border bg-linen-dark cursor-not-allowed'
              : selected
                ? 'bg-blue border-blue'
                : 'border-border bg-linen cursor-pointer'
          }`}
        >
          {selected && isAutoFixable && <CheckCircle2 size={10} className="text-white" />}
        </button>

        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${SEVERITY_DOT[severity]}`} />
            <p className="text-sm font-bold text-ink">{suggestion.title}</p>
            <div className="ml-auto flex items-center gap-1.5">
              {suggestion.dimension && (
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 border ${dimColor}`}>
                  {suggestion.dimension}
                </span>
              )}
              <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 border ${SEVERITY_STYLES[severity]}`}>
                {severity}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-ink-faint mb-2">{suggestion.description}</p>

          {/* Fix label */}
          <div className="flex items-center gap-2">
            <span className="label">Fix:</span>
            <span className={`text-xs font-semibold ${isAutoFixable ? 'text-ink' : 'text-ink-faint italic'}`}>
              {FIX_LABELS[suggestion.fix] ?? suggestion.fix}
            </span>
            {!isAutoFixable && (
              <span className="text-[10px] text-ink-faint">(not auto-applicable)</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────

export default function CleaningTab({ profile, onCleaned }: Props) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [applying, setApplying] = useState(false)

  const suggestions = profile.cleaning_suggestions
  const noIssues = suggestions.length === 0

  // Toggle a suggestion by its unique key (fix + affected_column)
  const toggleKey = (s: CleaningSuggestion) =>
    `${s.fix}::${s.affected_column ?? '__all__'}`

  const toggle = (s: CleaningSuggestion) => {
    const key = toggleKey(s)
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const selectAll = () =>
    setSelected(new Set(suggestions.map(toggleKey)))

  const clearAll = () => setSelected(new Set())

  const handleApply = async () => {
    if (selected.size === 0) {
      toast.error('Select at least one fix to apply.')
      return
    }

    const fixes: CleaningFix[] = suggestions
      .filter(s => selected.has(toggleKey(s)) && AUTO_FIXABLE.has(s.fix))
      .map(s => ({ fix: s.fix, affected_column: s.affected_column }))

    setApplying(true)
    try {
      const updated = await profileService.applyFixes(profile.dataset_id, fixes)
      toast.success('Cleaning complete — dataset updated.')
      setSelected(new Set())
      onCleaned(updated)
    } catch {
      toast.error('Failed to apply fixes. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  // Estimate health improvement (rough): each fix removes its issue's contribution
  const estimatedScore = Math.min(
    (profile.health_score ?? 0) +
    suggestions
      .filter(s => selected.has(toggleKey(s)))
      .reduce((acc, s) => {
        if (s.fix === 'drop_duplicates') return acc + 8
        if (s.severity === 'high') return acc + 6
        if (s.severity === 'medium') return acc + 3
        return acc + 1
      }, 0),
    100
  )

  return (
    <div className="space-y-6">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="label-blue mb-1">Data Quality Issues</p>
          <h3 className="text-lg font-black uppercase tracking-tight text-ink">
            {noIssues ? 'No Issues Detected' : `${suggestions.length} Issue${suggestions.length !== 1 ? 's' : ''} Found`}
          </h3>
        </div>

        {!noIssues && (
          <div className="flex items-center gap-2">
            <button onClick={selectAll} className="btn-secondary text-xs py-1.5 px-3">
              Select All
            </button>
            {selected.size > 0 && (
              <button onClick={clearAll} className="btn-secondary text-xs py-1.5 px-3">
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* No issues state */}
      {noIssues && (
        <div className="border border-border bg-linen p-10 text-center">
          <CheckCircle2 size={32} className="text-success mx-auto mb-3" />
          <p className="font-bold text-sm uppercase tracking-wide text-ink mb-1">
            Dataset looks clean
          </p>
          <p className="text-xs text-ink-faint">
            No missing values, duplicate rows, or high-null columns were detected.
          </p>
        </div>
      )}

      {/* Suggestion cards */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          {suggestions.map(s => (
            <SuggestionCard
              key={toggleKey(s)}
              suggestion={s}
              selected={selected.has(toggleKey(s))}
              onToggle={() => toggle(s)}
            />
          ))}
        </div>
      )}

      {/* Apply panel */}
      {selected.size > 0 && (
        <div className="border border-blue bg-blue-light/20 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-bold text-ink mb-1">
              {selected.size} fix{selected.size !== 1 ? 'es' : ''} selected
            </p>
            <div className="flex items-center gap-2 text-xs text-ink-faint">
              <span>Health score:</span>
              <span className="font-bold text-ink">{profile.health_score ?? 0}/100</span>
              <span>→</span>
              <span className="font-bold text-success">{estimatedScore}/100</span>
              <ScoreDelta before={profile.health_score ?? 0} after={estimatedScore} />
            </div>
          </div>
          <button
            onClick={handleApply}
            disabled={applying}
            className="btn-primary flex items-center gap-2 text-xs py-2.5 px-5 disabled:opacity-60"
          >
            {applying ? (
              <><Loader2 size={13} className="animate-spin" /> Applying Fixes...</>
            ) : (
              <>Apply {selected.size} Fix{selected.size !== 1 ? 'es' : ''}</>
            )}
          </button>
        </div>
      )}

      {/* Warning when no selection */}
      {!noIssues && selected.size === 0 && (
        <div className="flex items-start gap-2 text-xs text-ink-faint border-t border-border pt-4">
          <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" />
          Select issues above and click "Apply Fixes" to clean the dataset.
          The original file will be overwritten and the profile will update automatically.
        </div>
      )}
    </div>
  )
}
