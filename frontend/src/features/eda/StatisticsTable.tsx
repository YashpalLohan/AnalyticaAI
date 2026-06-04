import type { StatRow } from '../../services/eda.service'

interface Props {
  rows: StatRow[]
}

function fmt(val: number | null, decimals = 2): string {
  if (val === null || val === undefined) return '—'
  if (Number.isInteger(val)) return val.toLocaleString()
  return val.toFixed(decimals)
}

const COLS: { key: keyof StatRow; label: string; title: string }[] = [
  { key: 'column',  label: 'Column',  title: 'Column name' },
  { key: 'count',   label: 'Count',   title: 'Non-null count' },
  { key: 'mean',    label: 'Mean',    title: 'Arithmetic mean' },
  { key: 'std',     label: 'Std',     title: 'Standard deviation' },
  { key: 'min',     label: 'Min',     title: 'Minimum value' },
  { key: 'p25',     label: '25%',     title: '25th percentile' },
  { key: 'median',  label: 'Median',  title: '50th percentile (median)' },
  { key: 'p75',     label: '75%',     title: '75th percentile' },
  { key: 'max',     label: 'Max',     title: 'Maximum value' },
  { key: 'null_pct',label: 'Null %',  title: 'Percentage of null values' },
]

export default function StatisticsTable({ rows }: Props) {
  if (rows.length === 0) {
    return <p className="text-xs text-ink-faint">No numeric columns found.</p>
  }

  return (
    <div className="overflow-x-auto border border-border">
      <table className="w-full text-xs min-w-[700px]">
        <thead>
          <tr className="bg-linen-dark border-b border-border">
            {COLS.map(col => (
              <th
                key={col.key}
                title={col.title}
                className={`px-3 py-2.5 label font-bold text-left whitespace-nowrap
                  ${col.key === 'column' ? 'sticky left-0 bg-linen-dark z-10' : ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.column}
              className={`border-b border-border ${i % 2 === 0 ? 'bg-linen' : 'bg-linen-dark/30'}`}
            >
              <td className="px-3 py-2 font-mono font-semibold text-ink sticky left-0 bg-inherit z-10 border-r border-border">
                {row.column}
              </td>
              <td className="px-3 py-2 text-right font-mono text-ink-faint">{row.count.toLocaleString()}</td>
              <td className="px-3 py-2 text-right font-mono text-ink">{fmt(row.mean)}</td>
              <td className="px-3 py-2 text-right font-mono text-ink-faint">{fmt(row.std)}</td>
              <td className="px-3 py-2 text-right font-mono text-ink-faint">{fmt(row.min)}</td>
              <td className="px-3 py-2 text-right font-mono text-ink-faint">{fmt(row.p25)}</td>
              <td className="px-3 py-2 text-right font-mono text-ink font-semibold">{fmt(row.median)}</td>
              <td className="px-3 py-2 text-right font-mono text-ink-faint">{fmt(row.p75)}</td>
              <td className="px-3 py-2 text-right font-mono text-ink-faint">{fmt(row.max)}</td>
              <td className="px-3 py-2 text-right">
                <span className={`font-mono font-semibold ${row.null_pct > 20 ? 'text-error' : row.null_pct > 5 ? 'text-warning' : 'text-ink-faint'}`}>
                  {row.null_pct}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
