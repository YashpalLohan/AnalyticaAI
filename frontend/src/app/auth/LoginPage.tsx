import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
    } catch (err: any) {
      const msg = err?.response?.data?.detail?.message || 'Invalid email or password.'
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
          <p className="label text-blue/80 mb-4">Sign in</p>
          <h1 className="text-4xl font-black uppercase tracking-tight text-linen leading-tight mb-6">
            Welcome<br />back.
          </h1>
          <p className="text-sm text-linen/50 leading-relaxed max-w-xs">
            Continue your analysis. Your datasets and insights are waiting.
          </p>
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

          <p className="label-blue mb-2">Authentication</p>
          <h2 className="text-2xl font-black uppercase tracking-tight text-ink mb-8">Sign in</h2>

          {error && (
            <div className="bg-error-light border border-error text-error text-sm px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign in →'}
              </button>
            </div>
          </form>

          <p className="text-sm text-ink-faint mt-8">
            No account?{' '}
            <Link to="/register" className="text-ink font-semibold underline underline-offset-2 hover:text-blue transition-colors">
              Create one →
            </Link>
          </p>
        </div>
      </div>

    </div>
  )
}
