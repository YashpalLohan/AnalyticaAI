import { useAuthStore } from '../store/auth.store'
import authService from '../services/auth.service'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { resetGuestUsage } from '../lib/guestUsage'

export function useAuth() {
  const { user, isAuthenticated, isGuest, setAuth, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const login = async (email: string, password: string) => {
    const tokens = await authService.login({ email, password })
    localStorage.setItem('access_token', tokens.access_token)
    const me = await authService.getMe()
    setAuth(me, tokens.access_token, tokens.refresh_token, false)
    resetGuestUsage()   // clear guest limits on real login
    toast.success(`Welcome back, ${me.full_name.split(' ')[0]}!`)
    navigate('/dashboard')
  }

  const register = async (full_name: string, email: string, password: string) => {
    await authService.register({ full_name, email, password })
    await login(email, password)
    resetGuestUsage()   // clear guest limits on registration
  }

  const loginAsGuest = async () => {
    const tokens = await authService.guest()
    localStorage.setItem('access_token', tokens.access_token)
    const me = await authService.getMe()
    setAuth(me, tokens.access_token, tokens.refresh_token, true)
  }

  const logout = async () => {
    try { await authService.logout() } catch { /* ignore */ }
    clearAuth()
    navigate('/login')
  }

  return { user, isAuthenticated, isGuest, login, register, loginAsGuest, logout }
}
