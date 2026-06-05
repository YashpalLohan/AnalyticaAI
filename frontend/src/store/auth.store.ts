import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  full_name: string
  email: string
  is_verified: boolean
  avatar_url?: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isGuest: boolean
  setAuth: (user: User, accessToken: string, refreshToken: string, isGuest?: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isGuest: false,
      setAuth: (user, accessToken, refreshToken, isGuest = false) => {
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
        set({ user, accessToken, refreshToken, isAuthenticated: true, isGuest })
      },
      clearAuth: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isGuest: false })
      },
    }),
    { name: 'auth-storage', partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated, isGuest: state.isGuest }) }
  )
)
