import { apiClient } from '../lib/api-client'

// ── Types ──────────────────────────────────────────────────────────────────

export interface ColumnProfile {
  name: string
  dtype: string
  col_type: 'numeric' | 'categorical' | 'datetime' | 'boolean' | 'mixed'
  null_count: number
  null_percentage: number
  unique_count: number
  sample_values: (string | number | boolean | null)[]
  statistics: Record<string, number | null>
}

export interface CleaningSuggestion {
  issue: string
  dimension?: string
  title: string
  description: string
  severity: 'high' | 'medium' | 'low'
  fix: 'drop_duplicates' | 'fill_median' | 'fill_mode' | 'drop_column' | 'abs_value' | 'standardize_categories' | 'standardize_dates' | 'manual_review'
  affected_column: string | null
}

export interface DimensionScores {
  completeness: number
  validity: number
  uniqueness: number
  consistency: number
}

export interface DatasetProfile {
  id: string
  dataset_id: string
  row_count: number | null
  column_count: number | null
  missing_values: number | null
  duplicate_rows: number | null
  outlier_count: number | null
  memory_usage_mb: number | null
  health_score: number | null
  dimension_scores: DimensionScores | null
  columns: ColumnProfile[]
  cleaning_suggestions: CleaningSuggestion[]
}

export interface CleaningFix {
  fix: CleaningSuggestion['fix']
  affected_column: string | null
}

// ── Service ────────────────────────────────────────────────────────────────

const profileService = {
  /** Trigger (or re-trigger) profiling for a dataset. */
  async triggerProfile(datasetId: string): Promise<DatasetProfile> {
    const res = await apiClient.post<DatasetProfile>(`/datasets/${datasetId}/profile`)
    return res.data
  },

  /** Fetch existing profile results. Throws 404 if not yet profiled. */
  async getProfile(datasetId: string): Promise<DatasetProfile> {
    const res = await apiClient.get<DatasetProfile>(`/datasets/${datasetId}/profile`)
    return res.data
  },

  /** Apply selected cleaning fixes and return the refreshed profile. */
  async applyFixes(datasetId: string, fixes: CleaningFix[]): Promise<DatasetProfile> {
    const res = await apiClient.post<DatasetProfile>(
      `/datasets/${datasetId}/cleaning/apply`,
      { fixes },
    )
    return res.data
  },
}

export default profileService
