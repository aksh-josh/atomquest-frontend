import { useEffect, useState, useCallback } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { StatusBadge, Spinner, Modal, UoMLabel, PageHeader, ScoreBar } from '../../components/ui'
import { goalsAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Save, Send, Edit3, Target, ChevronDown } from 'lucide-react'

const UOM_OPTIONS = [
  { value: 'NUMERIC_MIN', label: '↑ Numeric (Higher Better)' },
  { value: 'NUMERIC_MAX', label: '↓ Numeric (Lower Better)' },
  { value: 'PERCENT_MIN', label: '% (Higher Better)' },
  { value: 'PERCENT_MAX', label: '% (Lower Better)' },
  { value: 'TIMELINE', label: '📅 Timeline (Date-based)' },
  { value: 'ZERO_BASED', label: '0 = Success' },
]

const QUARTER_OPTIONS = [
  { value: 'Q1_CHECKIN', label: 'Q1' },
  { value: 'Q2_CHECKIN', label: 'Q2' },
  { value: 'Q3_CHECKIN', label: 'Q3' },
  { value: 'Q4_ANNUAL', label: 'Annual' },
]

const emptyGoal = () => ({
  _id: Math.random().toString(36).slice(2),
  thrustAreaId: '',
  title: '',
  description: '',
  uom: 'NUMERIC_MIN',
  target: '',
  targetDate: '',
  weightage: 10,
})

export default function EmployeeGoals() {
  const [sheetData, setSheetData] = useState(null)
  const [goals, setGoals] = useState([emptyGoal()])
  const [thrustAreas, setThrustAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [achieveModal, setAchieveModal] = useState(null) // { goal }
  const [achieveForm, setAchieveForm] = useState({ quarter: 'Q1_CHECKIN', actualValue: '', completionDate: '', status: 'ON_TRACK' })

  const fetchData = useCallback(async () => {
    try {
      const [sheetRes, areasRes] = await Promise.all([goalsAPI.getMySheet(), goalsAPI.getThrustAreas()])
      setSheetData(sheetRes.data)
      setThrustAreas(areasRes.data.thrustAreas)
      const existingGoals = sheetRes.data.sheet?.goals
      if (existingGoals?.length > 0) {
        setGoals(existingGoals.map(g => ({ ...g, _id: g.id })))
      }
    } catch (err) {
      toast.error('Failed to load goals')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const totalWeightage = goals.reduce((s, g) => s + Number(g.weightage || 0), 0)
  const isEditable = !sheetData?.sheet?.status || ['DRAFT', 'REJECTED'].includes(sheetData?.sheet?.status)
  const isApproved = ['APPROVED', 'LOCKED'].includes(sheetData?.sheet?.status)

  const addGoal = () => {
    if (goals.length >= 8) return toast.error('Maximum 8 goals allowed')
    setGoals([...goals, emptyGoal()])
  }

  const removeGoal = (idx) => {
    if (goals.length === 1) return toast.error('At least one goal required')
    setGoals(goals.filter((_, i) => i !== idx))
  }

  const updateGoal = (idx, field, value) => {
    setGoals(goals.map((g, i) => i === idx ? { ...g, [field]: value } : g))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await goalsAPI.saveGoals(goals)
      toast.success('Goals saved as draft')
      fetchData()
    } catch (err) {
      const errs = err.response?.data?.errors
      if (errs) errs.forEach(e => toast.error(e))
      else toast.error(err.response?.data?.error || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (totalWeightage !== 100) return toast.error('Total weightage must equal 100%')
    setSubmitting(true)
    try {
      await goalsAPI.saveGoals(goals)
      await goalsAPI.submit()
      toast.success('Goals submitted for approval!')
      fetchData()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Submit failed'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogAchievement = async () => {
    try {
      await goalsAPI.updateAchievement(achieveModal.id, achieveForm)
      toast.success('Achievement logged!')
      setAchieveModal(null)
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed')
    }
  }

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Spinner /></div></AppLayout>

  const sheet = sheetData?.sheet

  return (
    <AppLayout>
      <PageHeader
        title="My Goals"
        subtitle={`${sheetData?.cycle?.name || ''} · Total Weightage: `}
        action={
          <div className="flex items-center gap-3">
            <span className={`font-mono font-700 text-lg ${totalWeightage === 100 ? 'text-success' : 'text-danger'}`}>
              {totalWeightage}%
            </span>
            {sheet?.status && <StatusBadge status={sheet.status} />}
          </div>
        }
      />

      {/* Manager note if rejected */}
      {sheet?.status === 'REJECTED' && sheet.managerNote && (
        <div className="mb-6 p-4 bg-danger/10 border border-danger/30 rounded-xl">
          <p className="text-xs font-mono text-danger uppercase tracking-widest mb-1">Manager Feedback</p>
          <p className="text-sm text-white">{sheet.managerNote}</p>
        </div>
      )}

      {/* Goals list */}
      <div className="space-y-4 mb-6">
        {goals.map((goal, idx) => (
          <div key={goal._id || idx} className="card animate-slide-up">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-volt/20 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-mono font-700 text-volt">{idx + 1}</span>
                </div>
                <span className="text-sm font-mono text-slate-dim">Goal {idx + 1}</span>
                {goal.isShared && <span className="badge bg-info/15 text-info border border-info/30">Shared</span>}
              </div>
              <div className="flex items-center gap-2">
                {isApproved && (
                  <button
                    onClick={() => { setAchieveModal(goal); setAchieveForm({ quarter: 'Q1_CHECKIN', actualValue: '', completionDate: '', status: 'ON_TRACK' }) }}
                    className="btn-success text-xs px-3 py-1.5 flex items-center gap-1"
                  >
                    <Edit3 size={12} /> Log Achievement
                  </button>
                )}
                {isEditable && (
                  <button onClick={() => removeGoal(idx)} className="w-7 h-7 rounded-lg bg-danger/10 hover:bg-danger/20 flex items-center justify-center text-danger transition-colors">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="label">Goal Title *</label>
                <input
                  className="input"
                  placeholder="e.g. Increase quarterly revenue by 20%"
                  value={goal.title}
                  onChange={e => updateGoal(idx, 'title', e.target.value)}
                  disabled={!isEditable}
                />
              </div>

              <div>
                <label className="label">Thrust Area *</label>
                <select
                  className="input"
                  value={goal.thrustAreaId}
                  onChange={e => updateGoal(idx, 'thrustAreaId', e.target.value)}
                  disabled={!isEditable}
                >
                  <option value="">Select thrust area...</option>
                  {thrustAreas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Unit of Measurement *</label>
                <select
                  className="input"
                  value={goal.uom}
                  onChange={e => updateGoal(idx, 'uom', e.target.value)}
                  disabled={!isEditable}
                >
                  {UOM_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              {goal.uom === 'TIMELINE' ? (
                <div>
                  <label className="label">Target Date *</label>
                  <input
                    type="date"
                    className="input"
                    value={goal.targetDate?.split('T')[0] || ''}
                    onChange={e => updateGoal(idx, 'targetDate', e.target.value)}
                    disabled={!isEditable}
                  />
                </div>
              ) : (
                <div>
                  <label className="label">Target Value *</label>
                  <input
                    type="number"
                    className="input"
                    placeholder="e.g. 100"
                    value={goal.target}
                    onChange={e => updateGoal(idx, 'target', e.target.value)}
                    disabled={!isEditable || goal.uom === 'ZERO_BASED'}
                  />
                </div>
              )}

              <div>
                <label className="label">Weightage % * (min 10%)</label>
                <input
                  type="number"
                  className="input"
                  min={10}
                  max={100}
                  value={goal.weightage}
                  onChange={e => updateGoal(idx, 'weightage', Number(e.target.value))}
                  disabled={!isEditable && !goal.isShared}
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">Description (optional)</label>
                <textarea
                  className="input resize-none"
                  rows={2}
                  placeholder="Additional context or success criteria..."
                  value={goal.description || ''}
                  onChange={e => updateGoal(idx, 'description', e.target.value)}
                  disabled={!isEditable}
                />
              </div>
            </div>

            {/* Achievements */}
            {goal.achievements?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-ink-600">
                <p className="text-xs font-mono text-slate-dim uppercase tracking-widest mb-3">Achievements</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {goal.achievements.map(a => (
                    <div key={a.id} className="p-2.5 bg-ink-700 rounded-xl">
                      <p className="text-xs font-mono text-slate-dim">{a.quarter.replace('_CHECKIN','').replace('_',' ')}</p>
                      <p className="text-sm font-700 text-white mt-1">
                        {a.actualValue ?? (a.completionDate ? new Date(a.completionDate).toLocaleDateString() : '—')}
                      </p>
                      {a.score != null && <ScoreBar score={a.score} />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      {isEditable && (
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={addGoal} disabled={goals.length >= 8} className="btn-secondary flex items-center gap-2">
            <Plus size={16} /> Add Goal
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-secondary flex items-center gap-2">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || totalWeightage !== 100}
            className="btn-primary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Send size={16} /> {submitting ? 'Submitting...' : 'Submit for Approval'}
          </button>
          {totalWeightage !== 100 && (
            <p className="text-xs text-danger font-mono">Total weightage must = 100%</p>
          )}
        </div>
      )}

      {/* Log Achievement Modal */}
      <Modal open={!!achieveModal} onClose={() => setAchieveModal(null)} title={`Log Achievement — ${achieveModal?.title}`}>
        <div className="space-y-4">
          <div>
            <label className="label">Quarter</label>
            <select className="input" value={achieveForm.quarter} onChange={e => setAchieveForm({ ...achieveForm, quarter: e.target.value })}>
              {QUARTER_OPTIONS.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
            </select>
          </div>

          {achieveModal?.uom === 'TIMELINE' ? (
            <div>
              <label className="label">Completion Date</label>
              <input type="date" className="input" value={achieveForm.completionDate} onChange={e => setAchieveForm({ ...achieveForm, completionDate: e.target.value })} />
            </div>
          ) : achieveModal?.uom !== 'ZERO_BASED' ? (
            <div>
              <label className="label">Actual Value</label>
              <input type="number" className="input" placeholder="Enter actual achieved value" value={achieveForm.actualValue} onChange={e => setAchieveForm({ ...achieveForm, actualValue: e.target.value })} />
            </div>
          ) : null}

          <div>
            <label className="label">Status</label>
            <select className="input" value={achieveForm.status} onChange={e => setAchieveForm({ ...achieveForm, status: e.target.value })}>
              <option value="NOT_STARTED">Not Started</option>
              <option value="ON_TRACK">On Track</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setAchieveModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleLogAchievement} className="btn-primary flex-1">Save Achievement</button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
