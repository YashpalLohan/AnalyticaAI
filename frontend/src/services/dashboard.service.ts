import { apiClient } from '../lib/api-client'

// ── Widget types ───────────────────────────────────────────────────────────

export interface KPIWidget {
  id: string
  type: 'kpi_card'
  title: string
  column: string
  aggregation: string
  format: string
  value: string
  raw_value: number | null
}

export interface BarWidget {
  id: string
  type: 'bar_chart'
  title: string
  x_column: string
  y_column: string
  aggregation: string
  data: { category: string; value: number }[]
}

export interface LineWidget {
  id: string
  type: 'line_chart'
  title: string
  x_column: string
  y_column: string
  data: { date: string; value: number }[]
}

export interface PieWidget {
  id: string
  type: 'pie_chart'
  title: string
  column: string
  data: { label: string; value: number }[]
}

export type DashboardWidget = KPIWidget | BarWidget | LineWidget | PieWidget

export interface Dashboard {
  dataset_id: string
  dataset_name: string
  widgets: DashboardWidget[]
}

// ── Service ────────────────────────────────────────────────────────────────

const dashboardService = {
  async generate(datasetId: string): Promise<Dashboard> {
    const res = await apiClient.post<Dashboard>(
      `/datasets/${datasetId}/dashboard`,
      null,
      { timeout: 90000 },  // LLM + data enrichment can take time
    )
    return res.data
  },

  async get(datasetId: string): Promise<Dashboard> {
    const res = await apiClient.get<Dashboard>(`/datasets/${datasetId}/dashboard`)
    return res.data
  },
}

export default dashboardService
