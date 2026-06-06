import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { MessageSquare, BarChart2, FileText } from 'lucide-react'

import LandingPage from './app/LandingPage'
import LoginPage from './app/auth/LoginPage'
import RegisterPage from './app/auth/RegisterPage'

import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/ProtectedRoute'

import DashboardPage from './app/dashboard/DashboardPage'
import DatasetsPage from './app/datasets/DatasetsPage'
import DatasetWorkspacePage from './app/datasets/DatasetWorkspacePage'
import DatasetPickerPage from './app/DatasetPickerPage'
import SettingsPage from './app/settings/SettingsPage'

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
          <Route path="/datasets/:id" element={<DatasetWorkspacePage />} />

          {/* Phase 4 — Chat picker */}
          <Route path="/chat" element={
            <DatasetPickerPage
              tab="chat"
              label="AI Chat"
              description="Select a dataset to start chatting with your data in natural language."
              icon={MessageSquare}
            />
          } />

          {/* Phase 3+5 — Analytics picker */}
          <Route path="/analytics" element={
            <DatasetPickerPage
              tab="eda"
              label="Analytics"
              description="Select a dataset to explore EDA charts, correlation heatmap, and auto-generated dashboards."
              icon={BarChart2}
            />
          } />

          {/* Phase 6 — Reports picker */}
          <Route path="/reports" element={
            <DatasetPickerPage
              tab="reports"
              label="Reports"
              description="Select a dataset to generate AI insights and download PDF or DOCX reports."
              icon={FileText}
            />
          } />

          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

// Temporary placeholder for unbuilt pages
// ComingSoon placeholder kept for settings route
function ComingSoon({ label, phase }: { label: string; phase: number }) {
  return (
    <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
      <p className="label-blue mb-3">Phase {phase}</p>
      <h2 className="text-2xl font-black uppercase tracking-tight text-ink mb-3">{label}</h2>
      <p className="text-sm text-ink-faint">This feature will be built in Phase {phase}.</p>
    </div>
  )
}
