import { User, Mail, Shield, Database, LogOut, Key } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useQuery } from '@tanstack/react-query'
import datasetService from '../../services/dataset.service'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border">
      <div className="px-5 py-3 border-b border-border bg-linen-dark">
        <p className="label text-ink font-bold">{title}</p>
      </div>
      <div className="bg-linen">{children}</div>
    </div>
  )
}

function Row({ label, value, icon: Icon }: { label: string; value: string; icon?: any }) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-border last:border-0">
      <div className="flex items-center gap-3">
        {Icon && <Icon size={14} className="text-ink-faint flex-shrink-0" />}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-ink-faint">{label}</p>
          <p className="text-sm font-semibold text-ink mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { user, logout } = useAuth()

  const { data: datasetsData } = useQuery({
    queryKey: ['datasets'],
    queryFn: () => datasetService.list(),
  })

  const datasetCount = datasetsData?.total ?? 0

  return (
    <div className="max-w-[800px] mx-auto px-6 py-10">

      {/* Header */}
      <div className="mb-8 border-b border-border pb-6">
        <p className="label-blue mb-1">Account</p>
        <h1 className="text-2xl font-black uppercase tracking-tight text-ink">Settings</h1>
      </div>

      <div className="space-y-6">

        {/* Profile */}
        <Section title="Profile">
          <Row icon={User}   label="Full Name" value={user?.full_name || '—'} />
          <Row icon={Mail}   label="Email"     value={user?.email || '—'} />
          <Row icon={Shield} label="Account Status" value={user?.is_verified ? 'Verified' : 'Unverified'} />
        </Section>

        {/* Usage */}
        <Section title="Usage">
          <Row icon={Database} label="Datasets Uploaded" value={`${datasetCount} dataset${datasetCount !== 1 ? 's' : ''}`} />
          <Row icon={Key}      label="API Model"          value="Groq — Llama 3.3 70B Versatile" />
        </Section>

        {/* Danger zone */}
        <Section title="Account">
          <div className="px-5 py-4">
            <p className="text-xs text-ink-faint mb-4 leading-relaxed">
              Signing out will clear your session. Your data and datasets are preserved.
            </p>
            <button
              onClick={logout}
              className="btn-secondary flex items-center gap-2 text-xs py-2.5 px-5 border-error text-error hover:bg-error hover:text-white"
            >
              <LogOut size={13} />
              Sign Out
            </button>
          </div>
        </Section>

      </div>
    </div>
  )
}
