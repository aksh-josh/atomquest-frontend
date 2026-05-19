import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { PageHeader, Spinner, PhaseBadge, EmptyState } from '../../components/ui'
import { checkinsAPI } from '../../services/api'
import { CheckSquare } from 'lucide-react'

const QUARTERS = ['GOAL_SETTING', 'Q1_CHECKIN', 'Q2_CHECKIN', 'Q3_CHECKIN', 'Q4_ANNUAL']

export default function EmployeeCheckIns() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkinsAPI.getMyCheckIns()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Spinner /></div></AppLayout>

  const checkIns = data?.checkIns || []
  const currentQuarter = data?.currentQuarter

  return (
    <AppLayout>
      <PageHeader title="My Check-ins" subtitle="Quarterly review history with your manager" />

      {/* Quarter timeline */}
      <div className="card mb-6">
        <p className="section-title mb-4">Cycle Timeline</p>
        <div className="flex items-center gap-2 flex-wrap">
          {QUARTERS.map((q, i) => {
            const done = checkIns.find(c => c.quarter === q)
            const isCurrent = q === currentQuarter
            return (
              <div key={q} className="flex items-center gap-2">
                <div className={`flex flex-col items-center px-4 py-3 rounded-xl border transition-all ${
                  done ? 'bg-success/10 border-success/30' :
                  isCurrent ? 'bg-volt/10 border-volt/40' :
                  'bg-ink-700 border-ink-600'
                }`}>
                  <div className={`w-2.5 h-2.5 rounded-full mb-1.5 ${done ? 'bg-success' : isCurrent ? 'bg-volt animate-pulse' : 'bg-ink-500'}`} />
                  <span className={`text-xs font-mono ${done ? 'text-success' : isCurrent ? 'text-volt' : 'text-slate-dim'}`}>
                    {q.replace('_CHECKIN', '').replace('_', ' ')}
                  </span>
                  {done && <span className="text-xs text-success mt-0.5">✓ Done</span>}
                  {isCurrent && !done && <span className="text-xs text-volt mt-0.5">Current</span>}
                </div>
                {i < QUARTERS.length - 1 && <div className="w-6 h-px bg-ink-600" />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Check-in cards */}
      {checkIns.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No check-ins yet" description="Your manager will log check-in notes after each quarterly review meeting." />
      ) : (
        <div className="space-y-4">
          {checkIns.map(ci => (
            <div key={ci.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <PhaseBadge phase={ci.quarter} />
                <span className="text-xs font-mono text-slate-dim">
                  {new Date(ci.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              {ci.comment ? (
                <blockquote className="border-l-2 border-volt pl-4 mt-2">
                  <p className="text-sm text-slate-soft italic">"{ci.comment}"</p>
                  <p className="text-xs text-slate-dim mt-2">— {ci.manager?.name}</p>
                </blockquote>
              ) : (
                <p className="text-sm text-slate-dim italic">No comment added</p>
              )}
            </div>
          ))}
        </div>
      )}
    </AppLayout>
  )
}
