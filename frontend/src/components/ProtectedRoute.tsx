import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/auth.store'
import authService from '../services/auth.service'

interface Props {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const { setAuth, clearAuth } = useAuthStore()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      const state = useAuthStore.getState()

      if (state.isAuthenticated && state.user) {
        // Verify the existing token still works against the backend
        try {
          await authService.getMe()
          // Token is valid — proceed
        } catch {
          // Token is stale (user doesn't exist in this DB environment)
          // Clear everything and create a fresh guest session
          clearAuth()
          try {
            const tokens = await authService.guest()
            localStorage.setItem('access_token', tokens.access_token)
            const me = await authService.getMe()
            setAuth(me, tokens.access_token, tokens.refresh_token, true)
          } catch {
            // Backend unreachable — render anyway
          }
        }
      } else {
        // Not authenticated — create guest session
        try {
          const tokens = await authService.guest()
          localStorage.setItem('access_token', tokens.access_token)
          const me = await authService.getMe()
          setAuth(me, tokens.access_token, tokens.refresh_token, true)
        } catch {
          // Backend unreachable — render anyway
        }
      }

      setReady(true)
    }
    init()
  }, [])

  if (!ready) return null
  return <>{children}</>
}
