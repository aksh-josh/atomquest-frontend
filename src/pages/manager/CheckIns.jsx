import { useEffect, useState, useCallback } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { PageHeader, Spinner, Modal, PhaseBadge, EmptyState } from '../../components/ui'
import { checkinsAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { MessageSquare, CheckSquare } from 'lucide-react'

const QUARTER_OPTIONS = [
  { value: 'Q1_CHECKIN', label: 'Q1 Check-in' },
  { value: 'Q2_CHECKIN', label: 'Q2 Check-in' },
  { value: 'Q3_CHECKIN', label: 'Q3 Check-in' },
  { value: 'Q4_ANNUAL', label: 'Annual Review' },
]

export default function ManagerCheckIns() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // { sheet }
  const [form, setForm] = useState({ quarter: 'Q1_CHECKIN', comment: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const res = await checkinsAPI.getTeamCheckIns()
      setData(res.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleSubmitCheckIn = async () => {
    if (!form.comment.trim()) return toast.error('Please add a comment')
    setSubmitting(true)
    try {
      await checkinsAPI.submitCheckIn(modal.id, form)
      toast.success('Check-in submitted!')
      setModal(null)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Spinner /></div></AppLayout>

  const sheets = data?.sheets || []
  const currentQuarter = data?.currentQuarter

  return (
    <AppLayout>
      <PageHeader title="Team Check-ins" subtitle={`Current phase: ${currentQuarter?.replace('_', ' ') || '—'}`} />

      {sheets.length === 0 ? (
        <EmptyState icon={CheckSquare} title="No approved sheets" description="Employees need approved goals before you can log check-ins." />
      ) : (
        <div className="space-y-4">
          {sheets.map(sheet => {
            const doneQuarters = sheet.checkIns.map(c => c.quarter)
            const currentDone = doneQuarters.includes(currentQuarter)

            return (
              <div key={sheet.id} className="card">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-ink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="font-display font-700 text-volt">{sheet.employee.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-500 text-white">{sheet.employee.name}</p>
                    <div className="flex gap-1.5 mt-1 flex-wrap">
                      {QUARTER_OPTIONS.map(q => (
                        <span key={q.value} className={`text-xs px-2 py-0.5 rounded-lg font-mono ${
                          doneQuarters.includes(q.value)
                            ? 'bg-success/15 text-success border border-success/30'
                            : 'bg-ink-700 text-slate-dim border border-ink-600'
                        }`}>
                          {q.label.replace(' Check-in', '')} {doneQuarters.includes(q.value) ? '✓' : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentDone && (
                      <span className="text-xs text-success font-mono">✓ Done this quarter</span>
                    )}
                    {['APPROVED', 'LOCKED'].includes(sheet.status) && !currentDone && (
                      <button
                        onClick={() => { setModal(sheet); setForm({ quarter: currentQuarter || 'Q1_CHECKIN', comment: '' }) }}
                        className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
                      >
                        <MessageSquare size={14} /> Log Check-in
                      </button>
                    )}
                  </div>
                </div>

                {/* Last check-in */}
                {sheet.checkIns.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-ink-600">
                    <p className="text-xs font-mono text-slate-dim uppercase tracking-widest mb-2">Recent Check-ins</p>
                    <div className="space-y-2">
                      {sheet.checkIns.slice(0, 2).map(ci => (
                        <div key={ci.id} className="flex items-start gap-3 p-2.5 bg-ink-700 rounded-xl">
                          <PhaseBadge phase={ci.quarter} />
                          <p className="text-sm text-slate-mid flex-1 italic">"{ci.comment || 'No comment'}"</p>
                          <span className="text-xs font-mono text-slate-dim whitespace-nowrap">
                            {new Date(ci.completedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal open={!!modal} onClose={() => setModal(null)} title={`Check-in — ${modal?.employee?.name}`}>
        <div className="space-y-4">
          <div>
            <label className="label">Quarter</label>
            <select className="input" value={form.quarter} onChange={e => setForm({ ...form, quarter: e.target.value })}>
              {QUARTER_OPTIONS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Check-in Notes *</label>
            <textarea
              className="input resize-none"
              rows={4}
              placeholder="Share feedback on progress, blockers, and next steps..."
              value={form.comment}
              onChange={e => setForm({ ...form, comment: e.target.value })}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSubmitCheckIn} disabled={submitting} className="btn-primary flex-1 disabled:opacity-60">
              {submitting ? 'Submitting...' : 'Submit Check-in'}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
