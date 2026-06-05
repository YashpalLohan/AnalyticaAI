import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

interface Props {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated } = useAuthStore()
  const [hydrated, setHydrated] = useState(false)

  // Wait for Zustand's persist middleware to rehydrate from localStorage
  // before making the redirect decision. Without this, a page refresh on
  // /dashboard incorrectly redirects to /login because isAuthenticated is
  // still false during the async rehydration tick.
  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setHydrated(true))
    // If already hydrated (e.g. navigating within the app), resolve immediately
    if (useAuthStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  // Show nothing while waiting for hydration — avoids flash of /login
  if (!hydrated) return null

  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}
