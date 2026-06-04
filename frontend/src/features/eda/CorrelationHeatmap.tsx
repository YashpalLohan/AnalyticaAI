import type { HeatmapData } from '../../services/eda.service'

interface Props {
  data: HeatmapData
}

/** Map correlation value -1..1 to a CSS background color */
function corrToColor(val: number | null): string {
  if (val === null) return '#F0EEE9'
  // -1 → red, 0 → white/linen, +1 → blue
  if (val > 0) {
    return `rgb(${59 - Math.round(val * 40)}, ${130 - Math.round(val * 60)}, ${246 - Math.round(val * 60)})`
  } else {
    const v = Math.abs(val)
    return `rgb(${220 + Math.round(v * 35)}, ${88 - Math.round(v * 60)}, ${88 - Math.round(v * 60)})`
  }
}

function textColor(val: number | null): string {
  if (val === null) return '#6B7280'
  return Math.abs(val) > 0.5 ? '#FFFFFF' : '#16191F'
}

export default function CorrelationHeatmap({ data }: Props) {
  const { columns, matrix } = data
  const n = columns.length

  // Truncate long column names
  const shortName = (s: string) => s.length > 10 ? s.slice(0, 9) + '…' : s

  return (
    <div className="overflow-x-auto">
      <div
        className="inline-grid gap-px bg-border"
        style={{ gridTemplateColumns: `80px repeat(${n}, minmax(52px, 1fr))` }}
      >
        {/* Top-left empty cell */}
        <div className="bg-linen-dark" />

        {/* Column headers */}
        {columns.map(col => (
          <div
            key={col}
            className="bg-linen-dark px-1 py-2 text-center"
            title={col}
          >
            <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wide">
              {shortName(col)}
            </span>
          </div>
        ))}

        {/* Rows */}
        {columns.map((row, ri) => (
          <>
            {/* Row label */}
            <div
              key={`label-${row}`}
              className="bg-linen-dark px-2 py-2 flex items-center justify-end"
              title={row}
            >
              <span className="text-[10px] font-bold text-ink-faint uppercase tracking-wide">
                {shortName(row)}
              </span>
            </div>

            {/* Cells */}
            {columns.map((col, ci) => {
              const val = matrix[ri]?.[ci] ?? null
              const displayVal = val !== null ? val.toFixed(2) : '—'
              return (
                <div
                  key={`${row}-${col}`}
                  className="flex items-center justify-center py-3 px-1"
                  style={{ background: corrToColor(val) }}
                  title={`${row} × ${col}: ${displayVal}`}
                >
                  <span
                    className="text-[11px] font-bold font-mono"
                    style={{ color: textColor(val) }}
                  >
                    {displayVal}
                  </span>
                </div>
              )
            })}
          </>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3">
        <div className="h-2 w-28 rounded-sm" style={{
          background: 'linear-gradient(to right, rgb(255,30,30), #F0EEE9, rgb(30,100,200))'
        }} />
        <span className="text-[10px] text-ink-faint">−1 (negative) &nbsp;→&nbsp; 0 (none) &nbsp;→&nbsp; +1 (positive)</span>
      </div>
    </div>
  )
}
