import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/auth.store'
import authService from '../services/auth.service'

interface Props {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const { setAuth } = useAuthStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Wait one tick for Zustand to rehydrate from localStorage
    const init = async () => {
      const hydrated = useAuthStore.getState().isAuthenticated
      if (!hydrated) {
        // Not logged in — auto-create a guest session silently
        try {
          const tokens = await authService.guest()
          localStorage.setItem('access_token', tokens.access_token)
          const me = await authService.getMe()
          setAuth(me, tokens.access_token, tokens.refresh_token, true)
        } catch {
          // If guest creation fails (e.g. backend offline), still render the app
          // The individual API calls will fail gracefully with toasts
        }
      }
      setReady(true)
    }
    init()
  }, [])

  // Show nothing while setting up guest session (usually < 500ms)
  if (!ready) return null

  return <>{children}</>
}
