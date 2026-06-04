import { apiClient } from '../lib/api-client'

// ── Chart data types ───────────────────────────────────────────────────────

export interface HistogramBin {
  bin: string
  count: number
  bin_start: number | null
  bin_end: number | null
}

export interface BarCategory {
  category: string
  count: number
}

export interface LinePoint {
  date: string
  [key: string]: string | number | null
}

export interface ScatterPoint {
  x: number | null
  y: number | null
}

export interface HeatmapData {
  type: 'heatmap'
  title: string
  columns: string[]
  matrix: (number | null)[][]
}

export interface HistogramChart {
  type: 'histogram'
  column: string
  title: string
  data: HistogramBin[]
  stats: { mean: number | null; median: number | null; std: number | null; min: number | null; max: number | null }
}

export interface BarChart {
  type: 'bar'
  column: string
  title: string
  data: BarCategory[]
}

export interface LineChart {
  type: 'line'
  title: string
  date_col: string
  value_cols: string[]
  data: LinePoint[]
}

export interface ScatterChart {
  type: 'scatter'
  title: string
  x_col: string
  y_col: string
  data: ScatterPoint[]
}

export type AnyChart = HistogramChart | BarChart | LineChart | ScatterChart | HeatmapData

// ── Statistics row ─────────────────────────────────────────────────────────

export interface StatRow {
  column: string
  count: number
  mean: number | null
  std: number | null
  min: number | null
  p25: number | null
  median: number | null
  p75: number | null
  max: number | null
  null_pct: number
}

// ── EDA result ─────────────────────────────────────────────────────────────

export interface EDAResult {
  charts: AnyChart[]
  statistics: StatRow[]
  shape: {
    rows: number
    columns: number
    numeric_columns: number
    categorical_columns: number
  }
}

// ── Service ────────────────────────────────────────────────────────────────

const edaService = {
  async triggerEDA(datasetId: string): Promise<EDAResult> {
    // EDA on large datasets can take time — use a longer timeout
    const res = await apiClient.post<EDAResult>(`/datasets/${datasetId}/eda`, null, {
      timeout: 120000,  // 2 minutes
    })
    return res.data
  },

  async getEDA(datasetId: string): Promise<EDAResult> {
    const res = await apiClient.get<EDAResult>(`/datasets/${datasetId}/eda`)
    return res.data
  },
}

export default edaService
