import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Handle 401/403 — clear token and redirect to login to get a fresh guest session
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      // Clear Zustand auth state
      const { useAuthStore } = await import('../store/auth.store')
      useAuthStore.getState().clearAuth()
      window.location.href = '/dashboard'  // re-triggers guest creation
    }
    return Promise.reject(error)
  }
)
