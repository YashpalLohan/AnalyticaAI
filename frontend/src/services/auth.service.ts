import { apiClient } from '../lib/api-client'

export interface RegisterData {
  full_name: string
  email: string
  password: string
}

export interface LoginData {
  email: string
  password: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
}

export interface UserProfile {
  id: string
  full_name: string
  email: string
  is_verified: boolean
  avatar_url?: string
}

const authService = {
  async guest(): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/guest')
    return response.data
  },

  async register(data: RegisterData) {
    const response = await apiClient.post('/auth/register', data)
    return response.data
  },

  async login(data: LoginData): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/login', data)
    return response.data
  },

  async logout() {
    await apiClient.post('/auth/logout')
  },

  async getMe(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/users/me')
    return response.data
  },

  async refresh(refreshToken: string): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/auth/refresh', { refresh_token: refreshToken })
    return response.data
  },
}

export default authService
