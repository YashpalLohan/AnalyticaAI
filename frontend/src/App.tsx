import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import LandingPage from './app/LandingPage'
import LoginPage from './app/auth/LoginPage'
import RegisterPage from './app/auth/RegisterPage'

import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'

import DashboardPage from './app/dashboard/DashboardPage'
import DatasetsPage from './app/datasets/DatasetsPage'

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#F0EEE9',
            color: '#16191F',
            border: '1px solid #DEDAD2',
            borderRadius: '0',
            fontSize: '13px',
            fontWeight: '600',
          },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected — wrapped in AppLayout (navbar + sidebar) */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/datasets" element={<DatasetsPage />} />
          {/* Placeholder routes — built in later phases */}
          <Route path="/datasets/:id" element={<DatasetsPage />} />
          <Route path="/chat" element={<ComingSoon label="AI Chat" phase={4} />} />
          <Route path="/analytics" element={<ComingSoon label="Analytics" phase={3} />} />
          <Route path="/reports" element={<ComingSoon label="Reports" phase={6} />} />
          <Route path="/settings" element={<ComingSoon label="Settings" phase={7} />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

// Temporary placeholder for unbuilt pages
function ComingSoon({ label, phase }: { label: string; phase: number }) {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
      <p className="label-blue mb-3">Phase {phase}</p>
      <h2 className="text-2xl font-black uppercase tracking-tight text-ink mb-3">{label}</h2>
      <p className="text-sm text-ink-faint">This feature will be built in Phase {phase}.</p>
    </div>
  )
}
