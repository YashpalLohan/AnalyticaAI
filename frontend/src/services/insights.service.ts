import { apiClient } from '../lib/api-client'

export interface Insight {
  type: 'trend' | 'risk' | 'opportunity' | 'recommendation'
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
}

export interface InsightsResult {
  executive_summary: string
  insights: Insight[]
}

const insightsService = {
  async generate(datasetId: string): Promise<InsightsResult> {
    const res = await apiClient.post<InsightsResult>(
      `/datasets/${datasetId}/insights`,
      null,
      { timeout: 60000 },
    )
    return res.data
  },

  async get(datasetId: string): Promise<InsightsResult> {
    const res = await apiClient.get<InsightsResult>(`/datasets/${datasetId}/insights`)
    return res.data
  },

  downloadPDF(datasetId: string): Promise<Blob> {
    return apiClient
      .post(`/datasets/${datasetId}/reports/pdf`, null, {
        responseType: 'blob',
        timeout: 120000,
      })
      .then(r => r.data as Blob)
  },

  downloadDOCX(datasetId: string): Promise<Blob> {
    return apiClient
      .post(`/datasets/${datasetId}/reports/docx`, null, {
        responseType: 'blob',
        timeout: 120000,
      })
      .then(r => r.data as Blob)
  },
}

export default insightsService
