import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { StatCard, StatusBadge, ScoreBar, PageHeader, Spinner, PhaseBadge } from '../../components/ui'
import { goalsAPI, checkinsAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Target, CheckSquare, TrendingUp, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function EmployeeDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [checkIns, setCheckIns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([goalsAPI.getMySheet(), checkinsAPI.getMyCheckIns()])
      .then(([sheetRes, ciRes]) => {
        setData(sheetRes.data)
        setCheckIns(ciRes.data.checkIns || [])
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <AppLayout>
      <div className="flex justify-center py-20"><Spinner /></div>
    </AppLayout>
  )

  const sheet = data?.sheet
  const cycle = data?.cycle
  const goals = sheet?.goals || []
  const overallScore = data?.overallScore || 0

  const approvedGoals = goals.filter(g => g.achievements?.length > 0)

  return (
    <AppLayout>
      <PageHeader
        title={`Hello, ${user?.name?.split(' ')[0]} 👋`}
        subtitle={cycle ? `${cycle.name} · ` : ''}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Overall Score" value={`${Math.round(overallScore)}%`} accent />
        <StatCard label="Goals Set" value={goals.length} sub={`of 8 max`} />
        <StatCard label="Check-ins Done" value={checkIns.length} sub="this cycle" />
        <StatCard
          label="Sheet Status"
          value={sheet?.status || 'No Sheet'}
          sub={sheet?.submittedAt ? `Submitted` : 'Not submitted'}
        />
      </div>

      {/* Score bar */}
      {goals.length > 0 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="section-title">Goal Progress</p>
            {sheet?.status && <StatusBadge status={sheet.status} />}
          </div>
          <ScoreBar score={overallScore / 100} />
          <div className="mt-4 grid grid-cols-1 gap-3">
            {goals.map((g) => {
              const latest = g.achievements?.slice(-1)[0]
              return (
                <div key={g.id} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{g.title}</p>
                    <p className="text-xs text-slate-dim">{g.thrustArea?.name} · {g.weightage}%</p>
                  </div>
                  <div className="w-32">
                    <ScoreBar score={latest?.score || 0} label="" />
                  </div>
                  <span className="text-xs font-mono text-slate-mid w-10 text-right">
                    {latest?.score != null ? `${Math.round(latest.score * 100)}%` : '—'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status card */}
        <div className="card">
          <p className="section-title mb-4">Goal Sheet Status</p>
          {!sheet || sheet.status === 'DRAFT' ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="w-12 h-12 bg-warn/10 rounded-xl flex items-center justify-center mb-3">
                <AlertCircle size={22} className="text-warn" />
              </div>
              <p className="text-white font-display font-700 mb-1">Goals not submitted</p>
              <p className="text-slate-mid text-sm mb-4">Define and submit your goals for manager approval</p>
              <Link to="/employee/goals" className="btn-primary text-sm px-5 py-2.5">
                Set Goals →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-mid">Status</span>
                <StatusBadge status={sheet.status} />
              </div>
              {sheet.submittedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-mid">Submitted</span>
                  <span className="text-sm text-white font-mono">{new Date(sheet.submittedAt).toLocaleDateString()}</span>
                </div>
              )}
              {sheet.approvedAt && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-mid">Approved</span>
                  <span className="text-sm text-success font-mono">{new Date(sheet.approvedAt).toLocaleDateString()}</span>
                </div>
              )}
              {sheet.managerNote && (
                <div className="mt-3 p-3 bg-ink-700 rounded-xl">
                  <p className="text-xs text-slate-dim mb-1">Manager Note</p>
                  <p className="text-sm text-white">{sheet.managerNote}</p>
                </div>
              )}
              {sheet.status === 'REJECTED' && (
                <Link to="/employee/goals" className="btn-danger w-full mt-2 text-center block">
                  Revise Goals →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Check-ins */}
        <div className="card">
          <p className="section-title mb-4">Check-in History</p>
          {checkIns.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <CheckSquare size={28} className="text-slate-dim mb-3" strokeWidth={1.5} />
              <p className="text-slate-mid text-sm">No check-ins yet this cycle</p>
            </div>
          ) : (
            <div className="space-y-3">
              {checkIns.map((ci) => (
                <div key={ci.id} className="p-3 bg-ink-700 rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <PhaseBadge phase={ci.quarter} />
                    <span className="text-xs font-mono text-slate-dim">{new Date(ci.completedAt).toLocaleDateString()}</span>
                  </div>
                  {ci.comment && <p className="text-sm text-slate-mid mt-2">"{ci.comment}"</p>}
                  <p className="text-xs text-slate-dim mt-1">by {ci.manager?.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
