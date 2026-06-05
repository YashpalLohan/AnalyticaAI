import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

interface Props {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: Props) {
  const { isAuthenticated } = useAuthStore()

  // Zustand persist rehydrates asynchronously from localStorage.
  // On first render isAuthenticated is false even for logged-in users,
  // causing an incorrect redirect to /login (blank screen bug).
  // We wait one tick for the store to hydrate before deciding.
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setReady(true)
  }, [])

  // Render nothing for one tick while Zustand rehydrates
  if (!ready) return null

  if (!isAuthenticated) return <Navigate to="/login" replace />

  return <>{children}</>
}
