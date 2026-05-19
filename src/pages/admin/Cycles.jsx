import { useEffect, useState, useCallback } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { PageHeader, Spinner, Modal, PhaseBadge } from '../../components/ui'
import { adminAPI, goalsAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Plus, Zap, Settings } from 'lucide-react'

const PHASES = ['GOAL_SETTING', 'Q1_CHECKIN', 'Q2_CHECKIN', 'Q3_CHECKIN', 'Q4_ANNUAL']

export default function AdminCycles() {
  const [cycles, setCycles] = useState([])
  const [thrustAreas, setThrustAreas] = useState([])
  const [loading, setLoading] = useState(true)
  const [cycleModal, setCycleModal] = useState(false)
  const [taModal, setTaModal] = useState(false)
  const [cycleForm, setCycleForm] = useState({ name: '', phase: 'GOAL_SETTING', startDate: '', endDate: '' })
  const [taForm, setTaForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [cycleRes, taRes] = await Promise.all([adminAPI.getCycles(), goalsAPI.getThrustAreas()])
      setCycles(cycleRes.data.cycles)
      setThrustAreas(taRes.data.thrustAreas)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCreateCycle = async () => {
    if (!cycleForm.name || !cycleForm.startDate || !cycleForm.endDate) return toast.error('All fields required')
    setSaving(true)
    try {
      await adminAPI.createCycle(cycleForm)
      toast.success('Cycle created!')
      setCycleModal(false)
      fetchData()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  const handleActivate = async (id) => {
    try {
      await adminAPI.activateCycle(id)
      toast.success('Cycle activated!')
      fetchData()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
  }

  const handleCreateTA = async () => {
    if (!taForm.name) return toast.error('Thrust area name required')
    setSaving(true)
    try {
      await adminAPI.createThrustArea(taForm)
      toast.success('Thrust area created!')
      setTaModal(false)
      setTaForm({ name: '', description: '' })
      fetchData()
    } catch (err) { toast.error(err.response?.data?.error || 'Failed') }
    finally { setSaving(false) }
  }

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Spinner /></div></AppLayout>

  return (
    <AppLayout>
      <PageHeader
        title="Cycles & Config"
        subtitle="Manage goal cycles and thrust areas"
        action={
          <div className="flex gap-2">
            <button onClick={() => setTaModal(true)} className="btn-secondary flex items-center gap-2 text-sm">
              <Settings size={15} /> Add Thrust Area
            </button>
            <button onClick={() => setCycleModal(true)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={15} /> New Cycle
            </button>
          </div>
        }
      />

      {/* Cycles */}
      <div className="mb-8">
        <p className="section-title mb-4">Goal Cycles</p>
        <div className="space-y-3">
          {cycles.map(c => (
            <div key={c.id} className={`card flex items-center gap-4 ${c.isActive ? 'border-volt/40' : ''}`}>
              <div className={`w-2 h-12 rounded-full ${c.isActive ? 'bg-volt' : 'bg-ink-600'}`} />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-display font-700 text-white">{c.name}</p>
                  {c.isActive && <span className="badge bg-volt/15 text-volt border border-volt/30">ACTIVE</span>}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <PhaseBadge phase={c.phase} />
                  <span className="text-xs font-mono text-slate-dim">
                    {new Date(c.startDate).toLocaleDateString()} → {new Date(c.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {!c.isActive && (
                <button onClick={() => handleActivate(c.id)} className="btn-secondary text-sm flex items-center gap-2">
                  <Zap size={14} /> Activate
                </button>
              )}
            </div>
          ))}
          {cycles.length === 0 && (
            <div className="card text-center py-8">
              <p className="text-slate-mid text-sm">No cycles created yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Thrust Areas */}
      <div>
        <p className="section-title mb-4">Thrust Areas</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {thrustAreas.map(ta => (
            <div key={ta.id} className="card p-4">
              <p className="font-display font-700 text-white text-sm">{ta.name}</p>
              {ta.description && <p className="text-xs text-slate-dim mt-1">{ta.description}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Create Cycle Modal */}
      <Modal open={cycleModal} onClose={() => setCycleModal(false)} title="Create New Cycle">
        <div className="space-y-4">
          <div>
            <label className="label">Cycle Name *</label>
            <input className="input" placeholder="e.g. FY 2025-26" value={cycleForm.name} onChange={e => setCycleForm({ ...cycleForm, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Phase *</label>
            <select className="input" value={cycleForm.phase} onChange={e => setCycleForm({ ...cycleForm, phase: e.target.value })}>
              {PHASES.map(p => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Start Date *</label>
              <input type="date" className="input" value={cycleForm.startDate} onChange={e => setCycleForm({ ...cycleForm, startDate: e.target.value })} />
            </div>
            <div>
              <label className="label">End Date *</label>
              <input type="date" className="input" value={cycleForm.endDate} onChange={e => setCycleForm({ ...cycleForm, endDate: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setCycleModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleCreateCycle} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
              {saving ? 'Creating...' : 'Create Cycle'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Create Thrust Area Modal */}
      <Modal open={taModal} onClose={() => setTaModal(false)} title="Add Thrust Area">
        <div className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input className="input" placeholder="e.g. Revenue Growth" value={taForm.name} onChange={e => setTaForm({ ...taForm, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} placeholder="Brief description..." value={taForm.description} onChange={e => setTaForm({ ...taForm, description: e.target.value })} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setTaModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleCreateTA} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
              {saving ? 'Creating...' : 'Add Thrust Area'}
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
