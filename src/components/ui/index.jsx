import { X } from 'lucide-react'

export const StatusBadge = ({ status }) => {
  const map = {
    DRAFT: 'badge-draft',
    SUBMITTED: 'badge-submitted',
    APPROVED: 'badge-approved',
    REJECTED: 'badge-rejected',
    LOCKED: 'badge-locked',
  }
  return <span className={map[status] || 'badge-draft'}>{status}</span>
}

export const PhaseBadge = ({ phase }) => {
  const labels = {
    GOAL_SETTING: 'Goal Setting',
    Q1_CHECKIN: 'Q1 Check-in',
    Q2_CHECKIN: 'Q2 Check-in',
    Q3_CHECKIN: 'Q3 Check-in',
    Q4_ANNUAL: 'Annual Review',
  }
  return (
    <span className="badge bg-volt/15 text-volt border border-volt/30">
      {labels[phase] || phase}
    </span>
  )
}

export const Spinner = ({ size = 'md' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`${sizes[size]} border-2 border-volt border-t-transparent rounded-full animate-spin`} />
  )
}

export const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 bg-ink-700 rounded-2xl flex items-center justify-center mb-4">
      <Icon size={28} className="text-slate-dim" strokeWidth={1.5} />
    </div>
    <p className="font-display font-700 text-white text-lg mb-2">{title}</p>
    <p className="text-slate-mid text-sm max-w-xs">{description}</p>
  </div>
)

export const Modal = ({ open, onClose, title, children, width = 'max-w-lg' }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${width} bg-ink-800 border border-ink-600 rounded-2xl shadow-card animate-slide-up max-h-[90vh] overflow-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-ink-600">
          <h2 className="font-display font-700 text-white text-lg">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-ink-700 hover:bg-ink-600 flex items-center justify-center text-slate-mid hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

export const StatCard = ({ label, value, sub, accent = false }) => (
  <div className={`stat-card ${accent ? 'border-volt/40 bg-volt/5' : ''}`}>
    <p className="text-xs font-mono text-slate-mid uppercase tracking-widest">{label}</p>
    <p className={`font-display text-3xl font-800 mt-1 ${accent ? 'text-volt' : 'text-white'}`}>{value}</p>
    {sub && <p className="text-xs text-slate-dim mt-1">{sub}</p>}
  </div>
)

export const ScoreBar = ({ score, label }) => {
  const pct = Math.min(Math.round((score || 0) * 100), 100)
  const color = pct >= 80 ? 'bg-success' : pct >= 50 ? 'bg-warn' : 'bg-danger'
  return (
    <div>
      {label && <div className="flex justify-between text-xs mb-1"><span className="text-slate-mid">{label}</span><span className="font-mono text-white">{pct}%</span></div>}
      <div className="h-1.5 bg-ink-600 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export const UoMLabel = ({ uom }) => {
  const labels = {
    NUMERIC_MIN: '↑ Higher Better',
    NUMERIC_MAX: '↓ Lower Better',
    PERCENT_MIN: '% Higher Better',
    PERCENT_MAX: '% Lower Better',
    TIMELINE: '📅 Timeline',
    ZERO_BASED: '0 = Success',
  }
  return <span className="text-xs text-slate-dim font-mono">{labels[uom] || uom}</span>
}

export const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between mb-8">
    <div>
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="text-slate-mid mt-1 text-sm">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
)
