import { useEffect, useState } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { StatCard, PageHeader, Spinner, StatusBadge, PhaseBadge } from '../../components/ui'
import { adminAPI, reportsAPI } from '../../services/api'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Download, Users, Activity } from 'lucide-react'
import toast from 'react-hot-toast'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink-700 border border-ink-500 rounded-xl p-3 text-sm">
      <p className="text-white font-mono">{label}</p>
      <p className="text-volt">{payload[0]?.value} employees</p>
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminAPI.getCompletionDashboard()
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleDownloadCSV = () => {
    const token = localStorage.getItem('aq_token')
    const base = import.meta.env.VITE_API_URL || 'https://atomquest-backend-g9l8.onrender.com'
    window.open(`${base}/api/reports/achievement?format=csv`, '_blank')
    toast.success('Downloading CSV report...')
  }

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Spinner /></div></AppLayout>

  const stats = data?.stats || {}
  const employees = data?.employees || []

  const chartData = [
    { name: 'Draft', value: stats.draft || 0, color: '#5A5A78' },
    { name: 'Submitted', value: stats.submitted || 0, color: '#47B8FF' },
    { name: 'Approved', value: stats.approved || 0, color: '#4DFFB4' },
    { name: 'Rejected', value: stats.rejected || 0, color: '#FF4D6D' },
  ]

  const byDept = employees.reduce((acc, e) => {
    const dept = e.employee.department || 'Unknown'
    acc[dept] = (acc[dept] || 0) + 1
    return acc
  }, {})

  const deptChart = Object.entries(byDept).map(([name, value]) => ({ name, value }))

  return (
    <AppLayout>
      <PageHeader
        title="Admin Dashboard"
        subtitle={`${data?.cycle?.name || 'Active Cycle'} · ${stats.total || 0} employees`}
        action={
          <button onClick={handleDownloadCSV} className="btn-secondary flex items-center gap-2">
            <Download size={16} /> Export CSV
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Employees" value={stats.total || 0} />
        <StatCard label="Submitted" value={stats.submitted || 0} accent={stats.submitted > 0} sub="Awaiting review" />
        <StatCard label="Approved" value={stats.approved || 0} />
        <StatCard label="Draft" value={stats.draft || 0} sub={`${stats.rejected || 0} rejected`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status chart */}
        <div className="card">
          <p className="section-title mb-4 flex items-center gap-2"><Activity size={18} /> Goal Sheet Status</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={40}>
              <XAxis dataKey="name" tick={{ fill: '#9999B3', fontSize: 12, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9999B3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Department chart */}
        <div className="card">
          <p className="section-title mb-4 flex items-center gap-2"><Users size={18} /> By Department</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptChart} barSize={40} layout="vertical">
              <XAxis type="number" tick={{ fill: '#9999B3', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9999B3', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} width={100} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="value" fill="#C8F135" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Employee table */}
      <div className="card">
        <p className="section-title mb-4">All Employees</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="text-left pb-3 pr-4">Employee</th>
                <th className="text-left pb-3 pr-4">Department</th>
                <th className="text-left pb-3 pr-4">Manager</th>
                <th className="text-center pb-3 pr-4">Goals</th>
                <th className="text-left pb-3 pr-4">Check-ins</th>
                <th className="text-left pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e, i) => (
                <tr key={i} className="table-row">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-ink-600 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-700 text-volt">{e.employee.name[0]}</span>
                      </div>
                      <div>
                        <p className="text-white">{e.employee.name}</p>
                        <p className="text-xs text-slate-dim">{e.employee.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-slate-mid">{e.employee.department || '—'}</td>
                  <td className="py-3 pr-4 text-slate-mid">{e.employee.manager?.name || '—'}</td>
                  <td className="py-3 pr-4 text-center font-mono text-white">{e.goalCount}</td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-1 flex-wrap">
                      {e.checkInsCompleted.map(q => (
                        <span key={q} className="text-xs bg-success/15 text-success border border-success/30 px-1.5 py-0.5 rounded font-mono">
                          {q.replace('_CHECKIN', '').replace('_', '')}
                        </span>
                      ))}
                      {e.checkInsCompleted.length === 0 && <span className="text-xs text-slate-dim">None</span>}
                    </div>
                  </td>
                  <td className="py-3"><StatusBadge status={e.goalSheetStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  )
}
