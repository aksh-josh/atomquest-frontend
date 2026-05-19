import { useEffect, useState, useCallback } from 'react'
import AppLayout from '../../components/layout/AppLayout'
import { PageHeader, Spinner, EmptyState } from '../../components/ui'
import { adminAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'

const ACTION_COLORS = {
  GOAL_SHEET_APPROVED: 'text-success',
  GOAL_SHEET_REJECTED: 'text-danger',
  MANAGER_INLINE_EDIT: 'text-warn',
  ADMIN_UNLOCK: 'text-volt',
}

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const limit = 20

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getAuditLogs({ page, limit })
      setLogs(res.data.logs)
      setTotal(res.data.total)
    } catch { toast.error('Failed to load audit logs') }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const totalPages = Math.ceil(total / limit)

  return (
    <AppLayout>
      <PageHeader title="Audit Logs" subtitle={`${total} total records`} />

      {loading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : logs.length === 0 ? (
        <EmptyState icon={BookOpen} title="No audit logs" description="Actions will appear here as users interact with the system." />
      ) : (
        <>
          <div className="card">
            <div className="space-y-1">
              {logs.map(log => {
                let details = null
                try { details = log.details ? JSON.parse(log.details) : null } catch {}

                return (
                  <div key={log.id} className="flex items-start gap-4 py-3 border-b border-ink-700 last:border-0">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-slate-dim mt-2" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-mono font-700 ${ACTION_COLORS[log.action] || 'text-slate-mid'}`}>
                          {log.action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-slate-dim">by</span>
                        <span className="text-xs text-white">{log.user?.name}</span>
                        <span className={`text-xs font-mono ${
                          log.user?.role === 'ADMIN' ? 'text-volt' :
                          log.user?.role === 'MANAGER' ? 'text-warn' : 'text-info'
                        }`}>({log.user?.role})</span>
                      </div>
                      {log.goalSheet && (
                        <p className="text-xs text-slate-dim mt-0.5">
                          Sheet: {log.goalSheet.employee?.name}
                        </p>
                      )}
                      {details && (
                        <div className="mt-1 p-2 bg-ink-700 rounded-lg">
                          {details.managerNote && <p className="text-xs text-slate-mid">Note: {details.managerNote}</p>}
                          {details.reason && <p className="text-xs text-slate-mid">Reason: {details.reason}</p>}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-mono text-slate-dim whitespace-nowrap flex-shrink-0">
                      {new Date(log.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs font-mono text-slate-dim">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary p-2 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary p-2 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </AppLayout>
  )
}
