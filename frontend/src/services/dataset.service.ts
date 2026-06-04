import { apiClient } from '../lib/api-client'

export interface Dataset {
  id: string
  name: string
  original_filename: string
  file_extension: string
  file_size: number | null
  total_rows: number | null
  total_columns: number | null
  status: string
  created_at: string
  updated_at: string
}

export interface DatasetListResponse {
  datasets: Dataset[]
  total: number
}

const datasetService = {
  async upload(file: File, onProgress?: (pct: number) => void): Promise<Dataset> {
    const form = new FormData()
    form.append('file', file)
    const res = await apiClient.post<Dataset>('/datasets/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: e => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      },
    })
    return res.data
  },

  async list(): Promise<DatasetListResponse> {
    const res = await apiClient.get<DatasetListResponse>('/datasets')
    return res.data
  },

  async get(id: string): Promise<Dataset> {
    const res = await apiClient.get<Dataset>(`/datasets/${id}`)
    return res.data
  },

  async rename(id: string, name: string): Promise<Dataset> {
    const res = await apiClient.patch<Dataset>(`/datasets/${id}`, { name })
    return res.data
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/datasets/${id}`)
  },
}

export default datasetService
