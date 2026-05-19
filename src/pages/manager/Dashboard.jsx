import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { StatCard, StatusBadge, PageHeader, Spinner, ScoreBar } from '../../components/ui'
import { goalsAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import { Users, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function ManagerDashboard() {
  const { user } = useAuth()
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    goalsAPI.getTeamSheets()
      .then(r => setSheets(r.data.sheets || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Spinner /></div></AppLayout>

  const pending = sheets.filter(s => s.status === 'SUBMITTED').length
  const approved = sheets.filter(s => ['APPROVED', 'LOCKED'].includes(s.status)).length
  const draft = sheets.filter(s => s.status === 'DRAFT').length
  const rejected = sheets.filter(s => s.status === 'REJECTED').length

  return (
    <AppLayout>
      <PageHeader
        title={`Team Overview`}
        subtitle={`${user?.name} · ${sheets.length} direct reports`}
        action={
          <Link to="/manager/team" className="btn-primary text-sm px-5 py-2.5">
            Review Goals →
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Reports" value={sheets.length} />
        <StatCard label="Pending Review" value={pending} accent={pending > 0} sub={pending > 0 ? 'Needs your action' : 'All clear'} />
        <StatCard label="Approved" value={approved} />
        <StatCard label="Draft / Rejected" value={draft + rejected} />
      </div>

      {/* Pending approvals */}
      {pending > 0 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="section-title flex items-center gap-2">
              <Clock size={18} className="text-warn" /> Pending Approval
            </p>
            <Link to="/manager/team" className="text-xs text-volt hover:underline">View all →</Link>
          </div>
          <div className="space-y-3">
            {sheets.filter(s => s.status === 'SUBMITTED').slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-ink-700 rounded-xl">
                <div>
                  <p className="text-sm font-500 text-white">{s.employee.name}</p>
                  <p className="text-xs text-slate-dim">{s.employee.department} · {s.goals.length} goals</p>
                </div>
                <div className="flex items-center gap-3">
                  <ScoreBar score={s.overallScore / 100} />
                  <StatusBadge status={s.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All team */}
      <div className="card">
        <p className="section-title mb-4 flex items-center gap-2"><Users size={18} /> All Team Members</p>
        {sheets.length === 0 ? (
          <p className="text-slate-mid text-sm text-center py-8">No team members found for this cycle</p>
        ) : (
          <div className="space-y-2">
            {sheets.map(s => (
              <div key={s.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-ink-700 transition-colors">
                <div className="w-9 h-9 bg-ink-600 rounded-xl flex items-center justify-center">
                  <span className="text-sm font-display font-700 text-volt">{s.employee.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-500 text-white">{s.employee.name}</p>
                  <p className="text-xs text-slate-dim">{s.goals.length} goals · {s.checkIns?.length || 0} check-ins</p>
                </div>
                <div className="hidden md:flex items-center gap-2 w-28">
                  <ScoreBar score={s.overallScore / 100} />
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
