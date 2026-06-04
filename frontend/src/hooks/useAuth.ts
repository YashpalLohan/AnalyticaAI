import { useAuthStore } from '../store/auth.store'
import authService from '../services/auth.service'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export function useAuth() {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const login = async (email: string, password: string) => {
    const tokens = await authService.login({ email, password })
    // Set access_token in localStorage first so getMe interceptor picks it up
    localStorage.setItem('access_token', tokens.access_token)
    const me = await authService.getMe()
    setAuth(me, tokens.access_token, tokens.refresh_token)
    toast.success(`Welcome back, ${me.full_name.split(' ')[0]}!`)
    navigate('/dashboard')
  }

  const register = async (full_name: string, email: string, password: string) => {
    await authService.register({ full_name, email, password })
    // Auto-login after registration
    await login(email, password)
  }

  const logout = async () => {
    try { await authService.logout() } catch { /* ignore */ }
    clearAuth()
    navigate('/login')
  }

  return { user, isAuthenticated, login, register, logout }
}
