import { Link } from 'react-router-dom'

const navLinks = ['Architecture', 'Laboratory', 'Intelligence', 'Node']

const features = [
  { tag: '01', title: 'Auto Profiling', desc: 'Instant schema detection, health score, missing values, outliers — no config needed.' },
  { tag: '02', title: 'AI Chat', desc: 'Ask questions in plain English. Get answers, charts, and tables back instantly.' },
  { tag: '03', title: 'Dashboard Engine', desc: 'One-click generation of KPI cards, trend charts, and category breakdowns.' },
  { tag: '04', title: 'Report Export', desc: 'Download professional PDF or DOCX reports with insights and visualizations.' },
]

const stats = [
  { value: '60s', label: 'From upload to insight' },
  { value: '100%', label: 'No SQL required' },
  { value: '∞', label: 'Dataset formats' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream font-sans">

      {/* ── Navbar ── */}
      <nav className="border-b border-border bg-cream sticky top-0 z-50">
        <div className="max-w-content mx-auto px-6 h-[60px] flex items-center justify-between">
          <span className="text-base font-black uppercase tracking-wider text-ink">
            AnalyticaAI<span className="text-red">.</span>
          </span>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(l => (
              <span key={l} className="label cursor-pointer hover:text-ink transition-colors">{l}</span>
            ))}
          </div>
          <Link to="/register" className="btn-primary text-xs py-2.5 px-5">
            Initialize →
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-grid border-b border-border">
        <div className="max-w-content mx-auto px-6 pt-20 pb-24">

          {/* Tag line */}
          <p className="label-red mb-6">AI Data Analytics Platform</p>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-black uppercase leading-none tracking-tighter text-ink mb-2">
            Talk to your
          </h1>
          <h1 className="text-5xl md:text-6xl font-black uppercase leading-none tracking-tighter text-ink mb-2">
            data. get
          </h1>
          <h1 className="text-5xl md:text-6xl font-black uppercase leading-none tracking-tighter text-red mb-12">
            insights.
          </h1>

          {/* Description + CTA side by side */}
          <div className="flex flex-col md:flex-row md:items-end gap-10">
            <div className="max-w-sm bg-ink text-cream p-6 shadow-flat-dark">
              <p className="text-sm leading-relaxed text-cream/80">
                AnalyticaAI is an AI-powered analytics platform that transforms
                uploaded datasets into dashboards, insights, and reports through
                natural language interaction — no SQL, no code, no manual work.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link to="/register" className="btn-primary">
                Start for free →
              </Link>
              <Link to="/login" className="btn-secondary text-center">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="border-b border-border bg-ink">
        <div className="max-w-content mx-auto px-6">
          <div className="grid grid-cols-3 divide-x divide-border-dark">
            {stats.map(s => (
              <div key={s.label} className="px-8 py-8">
                <p className="text-4xl font-black text-red mb-1">{s.value}</p>
                <p className="label text-cream/50">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-grid border-b border-border">
        <div className="max-w-content mx-auto px-6 py-20">
          <p className="label-red mb-4">Core Capabilities</p>
          <h2 className="text-3xl font-black uppercase tracking-tight text-ink mb-14">
            Everything you need<br />
            <span className="text-red">to understand data.</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
            {features.map((f) => (
              <div key={f.tag} className="bg-cream p-8 hover:bg-cream-dark transition-colors">
                <p className="label-red mb-4">{f.tag}</p>
                <h3 className="text-xl font-black uppercase tracking-tight text-ink mb-3">{f.title}</h3>
                <p className="text-sm text-ink-faint leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Workflow ── */}
      <section className="bg-ink border-b border-border-dark">
        <div className="max-w-content mx-auto px-6 py-20">
          <p className="label text-red mb-4">Workflow</p>
          <h2 className="text-3xl font-black uppercase tracking-tight text-cream mb-14">
            From raw data to<br />
            <span className="text-red">actionable insight.</span>
          </h2>
          <div className="flex flex-col md:flex-row gap-px bg-border-dark">
            {['Upload', 'Profile', 'Analyze', 'Chat', 'Export'].map((step, i) => (
              <div key={step} className="flex-1 bg-ink-soft p-6 border-t-2 border-t-red/0 hover:border-t-red transition-colors">
                <p className="text-xs text-ink-faint font-mono mb-3">0{i + 1}</p>
                <p className="text-base font-black uppercase tracking-wide text-cream">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-grid border-b border-border">
        <div className="max-w-content mx-auto px-6 py-24 text-center">
          <p className="label-red mb-4">Get Started</p>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-ink mb-8">
            Ready to talk to<br />
            <span className="text-red">your data?</span>
          </h2>
          <Link to="/register" className="btn-primary text-base px-10 py-4">
            Initialize Free Account →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-ink border-t border-border-dark">
        <div className="max-w-content mx-auto px-6 py-8 flex items-center justify-between">
          <span className="text-sm font-black uppercase tracking-wider text-cream">
            AnalyticaAI<span className="text-red">.</span>
          </span>
          <p className="text-xs text-ink-faint">
            Built with FastAPI · React · Groq · LangChain
          </p>
        </div>
      </footer>

    </div>
  )
}
