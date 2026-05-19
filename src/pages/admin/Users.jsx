import { useEffect, useState, useCallback } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { PageHeader, Spinner, Modal, EmptyState } from '../../components/ui'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, Users } from 'lucide-react'

const emptyForm = { name: '', email: '', password: '', role: 'EMPLOYEE', department: '', managerId: '' }

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | 'create' | user object
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const managers = users.filter(u => ['MANAGER', 'ADMIN'].includes(u.role))

  const fetchUsers = useCallback(async () => {
    try {
      const res = await adminAPI.getUsers()
      setUsers(res.data.users)
    } catch { toast.error('Failed to load users') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const openCreate = () => { setForm(emptyForm); setModal('create') }
  const openEdit = (user) => {
    setForm({ name: user.name, email: user.email, password: '', role: user.role, department: user.department || '', managerId: user.manager?.id || '' })
    setModal(user)
  }

  const handleSave = async () => {
    if (!form.name || !form.email) return toast.error('Name and email required')
    if (modal === 'create' && !form.password) return toast.error('Password required for new users')
    setSaving(true)
    try {
      if (modal === 'create') {
        await adminAPI.createUser(form)
        toast.success('User created!')
      } else {
        const { password, email, ...updateData } = form
        await adminAPI.updateUser(modal.id, updateData)
        toast.success('User updated!')
      }
      setModal(null)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await adminAPI.deleteUser(deleteConfirm.id)
      toast.success('User deleted')
      setDeleteConfirm(null)
      fetchUsers()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed')
    }
  }

  const roleColor = { EMPLOYEE: 'text-info', MANAGER: 'text-warn', ADMIN: 'text-volt' }

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Spinner /></div></AppLayout>

  return (
    <AppLayout>
      <PageHeader
        title="User Management"
        subtitle={`${users.length} total users`}
        action={
          <button onClick={openCreate} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Add User
          </button>
        }
      />

      {users.length === 0 ? (
        <EmptyState icon={Users} title="No users" description="Add your first user to get started." />
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="table-header">
                  <th className="text-left pb-3 pr-4">Name</th>
                  <th className="text-left pb-3 pr-4">Role</th>
                  <th className="text-left pb-3 pr-4">Department</th>
                  <th className="text-left pb-3 pr-4">Manager</th>
                  <th className="text-left pb-3 pr-4">Reports</th>
                  <th className="text-right pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="table-row">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-ink-600 rounded-xl flex items-center justify-center">
                          <span className={`text-xs font-700 ${roleColor[u.role]}`}>{u.name[0]}</span>
                        </div>
                        <div>
                          <p className="text-white">{u.name}</p>
                          <p className="text-xs text-slate-dim">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-mono font-700 ${roleColor[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="py-3 pr-4 text-slate-mid">{u.department || '—'}</td>
                    <td className="py-3 pr-4 text-slate-mid">{u.manager?.name || '—'}</td>
                    <td className="py-3 pr-4 font-mono text-white">{u._count?.reportees || 0}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(u)} className="w-7 h-7 rounded-lg bg-ink-700 hover:bg-ink-600 flex items-center justify-center text-slate-mid hover:text-white transition-colors">
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDeleteConfirm(u)} className="w-7 h-7 rounded-lg bg-danger/10 hover:bg-danger/20 flex items-center justify-center text-danger transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Add New User' : `Edit — ${modal?.name}`}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Full Name *</label>
              <input className="input" placeholder="Jane Smith" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="label">Email *</label>
              <input className="input" type="email" placeholder="jane@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} disabled={modal !== 'create'} />
            </div>
            {modal === 'create' && (
              <div className="col-span-2">
                <label className="label">Password *</label>
                <input className="input" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
            )}
            <div>
              <label className="label">Role</label>
              <select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="label">Department</label>
              <input className="input" placeholder="Engineering" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
            </div>
            <div className="col-span-2">
              <label className="label">Manager</label>
              <select className="input" value={form.managerId} onChange={e => setForm({ ...form, managerId: e.target.value })}>
                <option value="">No manager</option>
                {managers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
              {saving ? 'Saving...' : modal === 'create' ? 'Create User' : 'Update User'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete User">
        <div className="space-y-4">
          <p className="text-slate-mid text-sm">Are you sure you want to delete <strong className="text-white">{deleteConfirm?.name}</strong>? This cannot be undone.</p>
          <div className="flex gap-3">
            <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleDelete} className="btn-danger flex-1">Delete User</button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  )
}
