import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const perks = [
  'Automated dataset profiling',
  'AI chat interface',
  'Auto-generated dashboards',
  'PDF & DOCX report export',
]

export default function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      await register(form.full_name, form.email, form.password)
    } catch (err: any) {
      const msg = err?.response?.data?.detail?.message || 'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-grid flex">

      {/* ── Left — dark branding panel ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-grid-navy p-12 border-r border-border-dark">
        <Link to="/" className="text-sm font-black uppercase tracking-widest text-linen">
          AnalyticaAI<span className="text-blue">.</span>
        </Link>

        <div>
          <p className="label text-blue/80 mb-4">Create account</p>
          <h1 className="text-4xl font-black uppercase tracking-tight text-linen leading-tight mb-6">
            Initialize<br />your node.
          </h1>
          <p className="text-sm text-linen/50 leading-relaxed max-w-xs mb-10">
            Upload a dataset and get AI-powered insights in under 60 seconds.
            No SQL. No code. No setup required.
          </p>
          <div className="space-y-3">
            {perks.map(p => (
              <div key={p} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-blue flex-shrink-0" />
                <p className="text-xs text-linen/50">{p}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-ink-faint">© 2026 AnalyticaAI</p>
      </div>

      {/* ── Right — form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <Link to="/" className="lg:hidden block text-sm font-black uppercase tracking-widest text-ink mb-10">
            AnalyticaAI<span className="text-blue">.</span>
          </Link>

          <p className="label-blue mb-2">Registration</p>
          <h2 className="text-2xl font-black uppercase tracking-tight text-ink mb-8">
            Create account
          </h2>

          {error && (
            <div className="bg-error-light border border-error text-error text-sm px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label block mb-1.5">Full name</label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                className="input"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="label block mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="input"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="label block mb-1.5">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className="input"
                placeholder="Min. 8 characters"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Initialize account →'}
              </button>
            </div>
          </form>

          <p className="text-sm text-ink-faint mt-8">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-ink font-semibold underline underline-offset-2 hover:text-blue transition-colors"
            >
              Sign in →
            </Link>
          </p>
        </div>
      </div>

    </div>
  )
}
