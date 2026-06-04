import { Link } from 'react-router-dom'
import { BarChart2, MessageSquare, FileText, Zap } from 'lucide-react'

const features = [
  { icon: BarChart2, title: 'Auto EDA', desc: 'Instant charts and statistics from your data' },
  { icon: MessageSquare, title: 'AI Chat', desc: 'Ask questions in plain English' },
  { icon: FileText, title: 'Reports', desc: 'Export professional PDF reports' },
  { icon: Zap, title: 'Instant Insights', desc: 'AI-generated trends and recommendations' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-slate-100 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <span className="text-xl font-bold text-blue-600">AnalyticaAI</span>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-slate-600 hover:text-slate-900 text-sm font-medium">Sign in</Link>
          <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
          <Zap size={14} /> AI-Powered Analytics
        </div>
        <h1 className="text-5xl font-bold text-slate-900 leading-tight mb-6">
          Talk to Your Data.<br />
          <span className="text-blue-600">Get Insights in Seconds.</span>
        </h1>
        <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
          Upload a CSV. Ask questions. Get dashboards, charts, and reports — automatically.
          No SQL. No code. No manual work.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/register" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg">
            Start for Free
          </Link>
          <Link to="/login" className="text-slate-600 hover:text-slate-900 font-medium text-lg">
            Sign in →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="p-6 border border-slate-100 rounded-xl hover:border-blue-200 transition-colors">
              <f.icon className="text-blue-600 mb-3" size={24} />
              <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 px-6 py-8 text-center text-sm text-slate-400">
        © 2024 AnalyticaAI. Built with FastAPI + React + Groq.
      </footer>
    </div>
  )
}
