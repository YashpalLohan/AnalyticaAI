import { Database, AlertCircle, Copy } from 'lucide-react'
import type { DatasetProfile, ColumnProfile } from '../../services/profile.service'

interface Props {
  profile: DatasetProfile
}

// ── Health score ring ────────────────────────────────────────────────────

function HealthRing({ score }: { score: number }) {
  const radius = 42
  const circ = 2 * Math.PI * radius
  const filled = circ * (score / 100)
  const gap = circ - filled

  const color =
    score >= 90 ? '#22C55E' :
    score >= 75 ? '#84CC16' :
    score >= 55 ? '#F59E0B' :
    score >= 35 ? '#EF4444' :
    '#DC2626'

  const label =
    score >= 90 ? 'Excellent' :
    score >= 75 ? 'Good'      :
    score >= 55 ? 'Fair'      :
    score >= 35 ? 'Poor'      :
    'Critical'

  return (
    <div className="flex flex-col items-center justify-center">
      <svg width="112" height="112" viewBox="0 0 112 112">
        <circle cx="56" cy="56" r={radius} fill="none" stroke="#DEDAD2" strokeWidth="10" />
        <circle
          cx="56" cy="56" r={radius}
          fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${filled} ${gap}`}
          strokeLinecap="round"
          transform="rotate(-90 56 56)"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
        <text x="56" y="52" textAnchor="middle" fontSize="18" fontWeight="800" fill={color}>
          {score}
        </text>
        <text x="56" y="66" textAnchor="middle" fontSize="9" fill="#6B7280" fontWeight="600">
          /100
        </text>
      </svg>
      <p className="text-xs font-bold uppercase tracking-wide mt-1" style={{ color }}>
        {label}
      </p>
    </div>
  )
}

// ── Dimension bar ─────────────────────────────────────────────────────────

const DIM_CONFIG: Record<string, { label: string; weight: string; color: string }> = {
  completeness: { label: 'Completeness', weight: '35%', color: '#3B82F6' },
  validity:     { label: 'Validity',     weight: '25%', color: '#8B5CF6' },
  uniqueness:   { label: 'Uniqueness',   weight: '20%', color: '#F59E0B' },
  consistency:  { label: 'Consistency',  weight: '20%', color: '#10B981' },
}

function DimensionBar({ dim, score }: { dim: string; score: number }) {
  const cfg = DIM_CONFIG[dim]
  const barColor =
    score >= 90 ? '#22C55E' :
    score >= 75 ? '#84CC16' :
    score >= 55 ? '#F59E0B' :
    '#EF4444'

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
          <span className="text-xs font-semibold text-ink">{cfg.label}</span>
          <span className="text-[10px] text-ink-faint font-mono">{cfg.weight}</span>
        </div>
        <span className="text-xs font-bold text-ink">{score}/100</span>
      </div>
      <div className="h-2 bg-linen-dark overflow-hidden">
        <div
          className="h-full transition-all duration-700"
          style={{ width: `${score}%`, background: barColor }}
        />
      </div>
    </div>
  )
}

// ── KPI card ─────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-linen border border-border p-4">
      <p className="label mb-1">{label}</p>
      <p className="text-2xl font-black text-ink">{value}</p>
      {sub && <p className="text-xs text-ink-faint mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Type badge ────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  numeric:     'bg-blue-light text-blue',
  categorical: 'bg-purple-100 text-purple-700',
  datetime:    'bg-green-50 text-green-700',
  boolean:     'bg-yellow-50 text-yellow-700',
  mixed:       'bg-linen-dark text-ink-faint',
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 ${TYPE_COLORS[type] ?? TYPE_COLORS.mixed}`}>
      {type}
    </span>
  )
}

// ── Null bar ──────────────────────────────────────────────────────────────

function NullBar({ pct }: { pct: number }) {
  const color = pct > 20 ? '#EF4444' : pct > 5 ? '#F59E0B' : '#22C55E'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-linen-dark overflow-hidden">
        <div style={{ width: `${pct}%`, background: color, height: '100%' }} />
      </div>
      <span className="text-xs font-mono text-ink-faint w-10 text-right">{pct}%</span>
    </div>
  )
}

// ── Column table ──────────────────────────────────────────────────────────

function ColumnTable({ columns }: { columns: ColumnProfile[] }) {
  return (
    <div className="border border-border overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-linen-dark">
            <th className="text-left px-4 py-2.5 label font-bold">Column</th>
            <th className="text-left px-4 py-2.5 label font-bold">Type</th>
            <th className="text-left px-4 py-2.5 label font-bold w-36">Null %</th>
            <th className="text-right px-4 py-2.5 label font-bold">Unique</th>
            <th className="text-left px-4 py-2.5 label font-bold">Sample Values</th>
          </tr>
        </thead>
        <tbody>
          {columns.map((col, i) => (
            <tr key={col.name} className={`border-b border-border ${i % 2 === 0 ? 'bg-linen' : 'bg-linen-dark/40'}`}>
              <td className="px-4 py-2.5 font-mono font-semibold text-ink truncate max-w-[160px]">
                {col.name}
              </td>
              <td className="px-4 py-2.5">
                <TypeBadge type={col.col_type} />
              </td>
              <td className="px-4 py-2.5 w-36">
                <NullBar pct={col.null_percentage} />
              </td>
              <td className="px-4 py-2.5 text-right font-mono text-ink-faint">
                {col.unique_count.toLocaleString()}
              </td>
              <td className="px-4 py-2.5 text-ink-faint truncate max-w-[220px]">
                {col.sample_values.slice(0, 3).join(', ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────

export default function OverviewTab({ profile }: Props) {
  const dims = profile.dimension_scores

  return (
    <div className="space-y-8">

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-px bg-border">
        <KpiCard label="Rows" value={(profile.row_count ?? 0).toLocaleString()} />
        <KpiCard label="Columns" value={profile.column_count ?? 0} />
        <KpiCard
          label="Missing Values"
          value={(profile.missing_values ?? 0).toLocaleString()}
          sub={profile.row_count && profile.column_count
            ? `${((profile.missing_values ?? 0) / (profile.row_count * profile.column_count) * 100).toFixed(1)}% of cells`
            : undefined}
        />
        <KpiCard
          label="Duplicate Rows"
          value={(profile.duplicate_rows ?? 0).toLocaleString()}
          sub={profile.row_count
            ? `${((profile.duplicate_rows ?? 0) / profile.row_count * 100).toFixed(1)}% of rows`
            : undefined}
        />
        <KpiCard
          label="Memory"
          value={profile.memory_usage_mb != null ? `${profile.memory_usage_mb.toFixed(2)} MB` : '—'}
        />
      </div>

      {/* Health score + dimension breakdown */}
      <div className="border border-border bg-linen p-6">
        <div className="flex flex-col sm:flex-row gap-8">

          {/* Left: ring + summary */}
          <div className="flex flex-col sm:flex-row items-center gap-6 flex-shrink-0">
            <HealthRing score={profile.health_score ?? 0} />
            <div>
              <p className="label-blue mb-1">Dataset Health Score</p>
              <h3 className="text-xl font-black uppercase tracking-tight text-ink mb-1">
                {profile.health_score ?? 0}/100
              </h3>
              <p className="text-xs text-ink-faint max-w-[200px]">
                Weighted across 4 quality dimensions (DAMA DMBOK).
              </p>
              {/* Issue pills */}
              <div className="flex flex-col gap-1 mt-3">
                {profile.missing_values !== null && profile.missing_values > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-warning font-semibold">
                    <AlertCircle size={11} />
                    {profile.missing_values.toLocaleString()} missing values
                  </div>
                )}
                {profile.duplicate_rows !== null && profile.duplicate_rows > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-error font-semibold">
                    <Copy size={11} />
                    {profile.duplicate_rows.toLocaleString()} duplicate rows
                  </div>
                )}
                {(profile.missing_values === 0 && profile.duplicate_rows === 0) && (
                  <div className="flex items-center gap-1.5 text-[11px] text-success font-semibold">
                    <Database size={11} />
                    No completeness/uniqueness issues
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: dimension bars */}
          {dims && (
            <div className="flex-1 space-y-3 border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-8">
              <p className="label mb-3">Quality Dimensions</p>
              {Object.entries(dims).map(([dim, score]) => (
                <DimensionBar key={dim} dim={dim} score={score as number} />
              ))}
              <p className="text-[10px] text-ink-faint pt-1">
                Completeness 35% · Validity 25% · Uniqueness 20% · Consistency 20%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Column breakdown */}
      <div>
        <p className="label mb-3">Column Breakdown</p>
        <ColumnTable columns={profile.columns} />
      </div>
    </div>
  )
}
