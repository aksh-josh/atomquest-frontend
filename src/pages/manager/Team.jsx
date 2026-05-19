import { useEffect, useState, useCallback } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { StatusBadge, Spinner, Modal, ScoreBar, PageHeader, UoMLabel, EmptyState } from '../../components/ui'
import { goalsAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Eye, Users, ChevronDown, ChevronUp } from 'lucide-react'

export default function ManagerTeam() {
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('ALL')
  const [expanded, setExpanded] = useState(null)
  const [actionModal, setActionModal] = useState(null) // { type: 'approve'|'reject', sheet }
  const [note, setNote] = useState('')
  const [acting, setActing] = useState(false)

  const fetchTeam = useCallback(async () => {
    setLoading(true)
    try {
      const res = await goalsAPI.getTeamSheets(filter !== 'ALL' ? { status: filter } : {})
      setSheets(res.data.sheets || [])
    } catch { toast.error('Failed to load team') }
    finally { setLoading(false) }
  }, [filter])

  useEffect(() => { fetchTeam() }, [fetchTeam])

  const handleAction = async () => {
    if (!actionModal) return
    if (actionModal.type === 'reject' && !note.trim()) return toast.error('Please provide a reason for rejection')
    setActing(true)
    try {
      if (actionModal.type === 'approve') {
        await goalsAPI.approveSheet(actionModal.sheet.id, { managerNote: note })
        toast.success('Goals approved!')
      } else {
        await goalsAPI.rejectSheet(actionModal.sheet.id, { managerNote: note })
        toast.success('Sheet returned for rework')
      }
      setActionModal(null)
      setNote('')
      fetchTeam()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed')
    } finally {
      setActing(false)
    }
  }

  const filters = ['ALL', 'SUBMITTED', 'APPROVED', 'DRAFT', 'REJECTED']

  return (
    <AppLayout>
      <PageHeader title="Team Goals" subtitle="Review, approve, or return goal sheets" />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-mono transition-all ${
              filter === f ? 'bg-volt text-ink-900 font-700' : 'bg-ink-800 border border-ink-600 text-slate-mid hover:text-white'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : sheets.length === 0 ? (
        <EmptyState icon={Users} title="No sheets found" description="No goal sheets match the selected filter." />
      ) : (
        <div className="space-y-4">
          {sheets.map(sheet => (
            <div key={sheet.id} className="card">
              {/* Header */}
              <div className="flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(expanded === sheet.id ? null : sheet.id)}>
                <div className="w-10 h-10 bg-ink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-700 text-volt">{sheet.employee.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-500 text-white">{sheet.employee.name}</p>
                  <p className="text-xs text-slate-dim">{sheet.employee.department} · {sheet.goals.length} goals</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden md:block w-24">
                    <ScoreBar score={(sheet.overallScore || 0) / 100} />
                  </div>
                  <StatusBadge status={sheet.status} />
                  {expanded === sheet.id ? <ChevronUp size={16} className="text-slate-dim" /> : <ChevronDown size={16} className="text-slate-dim" />}
                </div>
              </div>

              {/* Expanded details */}
              {expanded === sheet.id && (
                <div className="mt-4 pt-4 border-t border-ink-600 animate-slide-up">
                  {/* Goals table */}
                  <div className="overflow-x-auto mb-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="table-header">
                          <th className="text-left pb-3 pr-4">Goal</th>
                          <th className="text-left pb-3 pr-4">Thrust Area</th>
                          <th className="text-left pb-3 pr-4">UoM</th>
                          <th className="text-right pb-3 pr-4">Target</th>
                          <th className="text-right pb-3">Weight</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sheet.goals.map(g => (
                          <tr key={g.id} className="table-row">
                            <td className="py-3 pr-4 max-w-xs">
                              <p className="text-white truncate">{g.title}</p>
                              {g.description && <p className="text-xs text-slate-dim truncate">{g.description}</p>}
                            </td>
                            <td className="py-3 pr-4 text-slate-mid">{g.thrustArea?.name}</td>
                            <td className="py-3 pr-4"><UoMLabel uom={g.uom} /></td>
                            <td className="py-3 pr-4 text-right font-mono text-white">
                              {g.uom === 'TIMELINE' ? (g.targetDate ? new Date(g.targetDate).toLocaleDateString() : '—') : g.target}
                            </td>
                            <td className="py-3 text-right font-mono text-volt">{g.weightage}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Manager note */}
                  {sheet.managerNote && (
                    <div className="mb-4 p-3 bg-ink-700 rounded-xl">
                      <p className="text-xs text-slate-dim mb-1">Previous note</p>
                      <p className="text-sm text-white">{sheet.managerNote}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {sheet.status === 'SUBMITTED' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setActionModal({ type: 'approve', sheet }); setNote('') }}
                        className="btn-success flex items-center gap-2"
                      >
                        <CheckCircle size={16} /> Approve
                      </button>
                      <button
                        onClick={() => { setActionModal({ type: 'reject', sheet }); setNote('') }}
                        className="btn-danger flex items-center gap-2"
                      >
                        <XCircle size={16} /> Return for Rework
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Approve / Reject Modal */}
      <Modal
        open={!!actionModal}
        onClose={() => setActionModal(null)}
        title={actionModal?.type === 'approve' ? '✅ Approve Goal Sheet' : '↩ Return for Rework'}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-mid">
            {actionModal?.type === 'approve'
              ? `You are approving ${actionModal?.sheet?.employee?.name}'s goals. Once approved, the goals will be locked for the cycle.`
              : `Please provide feedback for ${actionModal?.sheet?.employee?.name} to revise their goals.`}
          </p>
          <div>
            <label className="label">{actionModal?.type === 'approve' ? 'Note (optional)' : 'Reason for rejection *'}</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder={actionModal?.type === 'approve' ? 'Add any comments...' : 'Explain what needs to be changed...'}
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setActionModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button
              onClick={handleAction}
              disabled={acting}
              className={`flex-1 flex items-center justify-center gap-2 ${actionModal?.type === 'approve' ? 'btn-success' : 'btn-danger'} disabled:opacity-60`}
            >
              {acting ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : null}
              {actionModal?.type === 'approve' ? 'Confirm Approval' : 'Return Sheet'}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
