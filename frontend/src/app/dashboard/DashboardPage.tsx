import { useAuth } from '../../hooks/useAuth'
import { LogOut, BarChart2, Upload, MessageSquare, FileText } from 'lucide-react'

const quickActions = [
  { icon: Upload, label: 'Upload Dataset', desc: 'CSV, XLSX, or JSON', color: 'bg-blue-50 text-blue-600' },
  { icon: MessageSquare, label: 'Chat with Data', desc: 'Ask questions', color: 'bg-purple-50 text-purple-600' },
  { icon: BarChart2, label: 'View Analytics', desc: 'Charts and stats', color: 'bg-green-50 text-green-600' },
  { icon: FileText, label: 'Generate Report', desc: 'PDF or DOCX', color: 'bg-orange-50 text-orange-600' },
]

export default function DashboardPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-blue-600">AnalyticaAI</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{user?.full_name}</span>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {user?.full_name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500">Upload a dataset to get started with AI-powered analytics.</p>
        </div>

        {/* Stats placeholder */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {['Datasets', 'Reports', 'Insights'].map((label) => (
            <div key={label} className="bg-white border border-slate-100 rounded-xl p-6">
              <p className="text-sm text-slate-500 mb-1">{label}</p>
              <p className="text-3xl font-bold text-slate-900">0</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                className="bg-white border border-slate-100 rounded-xl p-5 text-left hover:border-blue-200 hover:shadow-sm transition-all"
              >
                <div className={`inline-flex p-2 rounded-lg mb-3 ${action.color}`}>
                  <action.icon size={20} />
                </div>
                <p className="font-medium text-slate-900 text-sm">{action.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Empty state */}
        <div className="mt-12 bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <Upload className="mx-auto text-slate-300 mb-4" size={40} />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No datasets yet</h3>
          <p className="text-slate-500 text-sm mb-6">Upload your first CSV file to begin analysis.</p>
          <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Upload Dataset
          </button>
        </div>
      </main>
    </div>
  )
}
