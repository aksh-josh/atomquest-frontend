import { useEffect, useState } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { PageHeader, Spinner, EmptyState } from '../components/ui'
import { reportsAPI } from '../services/api'
import { Trophy, Medal, TrendingUp, Users } from 'lucide-react'

const MEDAL = {
  1: { icon: '🥇', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  2: { icon: '🥈', color: 'text-slate-300', bg: 'bg-slate-300/10 border-slate-300/30' },
  3: { icon: '🥉', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30' },
}

const ScoreRing = ({ score, size = 56 }) => {
  const pct = Math.min(score, 100)
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  const color = pct >= 80 ? '#4DFFB4' : pct >= 50 ? '#FFB547' : '#FF4D6D'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#252535" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-mono font-700 text-white">{Math.round(pct)}%</span>
      </div>
    </div>
  )
}

export default function Leaderboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('individual') // 'individual' | 'department'

  useEffect(() => {
    reportsAPI.getLeaderboard()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Spinner /></div></AppLayout>

  const leaderboard = data?.leaderboard || []
  const deptLeaderboard = data?.deptLeaderboard || []

  const top3 = leaderboard.slice(0, 3)
  const rest = leaderboard.slice(3)

  return (
    <AppLayout>
      <PageHeader
        title="Leaderboard"
        subtitle={`${data?.cycle?.name || 'Active Cycle'} · ${leaderboard.length} participants`}
        action={
          <div className="flex gap-2">
            <button
              onClick={() => setView('individual')}
              className={`px-4 py-2 rounded-xl text-sm font-mono transition-all ${view === 'individual' ? 'bg-volt text-ink-900 font-700' : 'bg-ink-800 border border-ink-600 text-slate-mid hover:text-white'}`}
            >
              Individual
            </button>
            <button
              onClick={() => setView('department')}
              className={`px-4 py-2 rounded-xl text-sm font-mono transition-all ${view === 'department' ? 'bg-volt text-ink-900 font-700' : 'bg-ink-800 border border-ink-600 text-slate-mid hover:text-white'}`}
            >
              Department
            </button>
          </div>
        }
      />

      {leaderboard.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No data yet"
          description="Leaderboard appears once employees have approved goals with logged achievements."
        />
      ) : view === 'individual' ? (
        <>
          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div className="mb-8">
              <p className="text-xs font-mono text-slate-dim uppercase tracking-widest mb-4 flex items-center gap-2">
                <Trophy size={12} className="text-volt" /> Top Performers
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {top3.map(entry => {
                  const medal = MEDAL[entry.rank]
                  return (
                    <div key={entry.rank} className={`card border ${medal?.bg || ''} flex flex-col items-center text-center gap-3 py-6 animate-slide-up`}>
                      <span className="text-3xl">{medal?.icon}</span>
                      <div className="w-14 h-14 bg-ink-600 rounded-2xl flex items-center justify-center">
                        <span className="font-display font-800 text-volt text-xl">{entry.employee.name[0]}</span>
                      </div>
                      <div>
                        <p className="font-display font-700 text-white">{entry.employee.name}</p>
                        <p className="text-xs text-slate-dim">{entry.department}</p>
                        <p className="text-xs text-slate-dim">{entry.manager !== '—' ? `→ ${entry.manager}` : ''}</p>
                      </div>
                      <ScoreRing score={entry.overallScore} size={64} />
                      <div className="text-xs font-mono text-slate-dim">{entry.goalCount} goals</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Rest of leaderboard */}
          {rest.length > 0 && (
            <div className="card">
              <p className="section-title mb-4 flex items-center gap-2"><TrendingUp size={18} /> Full Rankings</p>
              <div className="space-y-2">
                {rest.map(entry => (
                  <div key={entry.rank} className="flex items-center gap-4 py-3 px-2 rounded-xl hover:bg-ink-700 transition-colors">
                    <span className="w-8 text-center font-mono text-slate-dim text-sm">#{entry.rank}</span>
                    <div className="w-9 h-9 bg-ink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-700 text-volt">{entry.employee.name[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-500 text-white">{entry.employee.name}</p>
                      <p className="text-xs text-slate-dim">{entry.department} · {entry.goalCount} goals</p>
                    </div>
                    <div className="hidden md:block text-xs text-slate-dim truncate max-w-[160px]">
                      {entry.topGoal}
                    </div>
                    <ScoreRing score={entry.overallScore} size={44} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Department view */
        <div className="space-y-4">
          <p className="text-xs font-mono text-slate-dim uppercase tracking-widest flex items-center gap-2">
            <Users size={12} className="text-volt" /> Department Rankings (Avg Score)
          </p>
          {deptLeaderboard.map((dept, i) => {
            const medal = MEDAL[i + 1]
            const pct = Math.min(dept.avgScore, 100)
            const barColor = pct >= 80 ? 'bg-success' : pct >= 50 ? 'bg-warn' : 'bg-danger'
            return (
              <div key={dept.dept} className={`card flex items-center gap-5 ${medal ? `border ${medal.bg}` : ''}`}>
                <div className="text-2xl w-8 text-center">{medal?.icon || `#${i + 1}`}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-display font-700 text-white">{dept.dept}</p>
                      <p className="text-xs text-slate-dim">{dept.count} employee{dept.count !== 1 ? 's' : ''}</p>
                    </div>
                    <span className="font-mono font-800 text-2xl text-white">{dept.avgScore}%</span>
                  </div>
                  <div className="h-2 bg-ink-600 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-700`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </AppLayout>
  )
}
