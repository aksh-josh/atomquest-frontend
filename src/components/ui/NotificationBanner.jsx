import { useState } from 'react'
import { useNotifications } from '../../hooks/useNotifications'
import { Link } from 'react-router-dom'
import { AlertTriangle, Info, CheckCircle, XCircle, X, ChevronDown, ChevronUp, Bell } from 'lucide-react'

const ICONS = {
  warning: { icon: AlertTriangle, color: 'text-warn', bg: 'bg-warn/10 border-warn/25' },
  error:   { icon: XCircle,       color: 'text-danger', bg: 'bg-danger/10 border-danger/25' },
  success: { icon: CheckCircle,   color: 'text-success', bg: 'bg-success/10 border-success/25' },
  info:    { icon: Info,          color: 'text-info', bg: 'bg-info/10 border-info/25' },
}

export default function NotificationBanner() {
  const { notifications } = useNotifications()
  const [dismissed, setDismissed] = useState([])
  const [expanded, setExpanded] = useState(false)

  const visible = notifications.filter(n => !dismissed.includes(n.id))
  if (visible.length === 0) return null

  const shown = expanded ? visible : visible.slice(0, 1)

  return (
    <div className="px-8 pt-6 space-y-2">
      {shown.map(notif => {
        const cfg = ICONS[notif.type] || ICONS.info
        const Icon = cfg.icon
        return (
          <div key={notif.id} className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${cfg.bg} animate-slide-up`}>
            <Icon size={16} className={`${cfg.color} mt-0.5 flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-500 ${cfg.color}`}>{notif.title}</p>
              <p className="text-xs text-slate-mid mt-0.5 truncate">{notif.message}</p>
            </div>
            {notif.link && (
              <Link
                to={notif.link}
                className={`text-xs font-mono font-600 ${cfg.color} hover:underline whitespace-nowrap flex-shrink-0`}
              >
                {notif.linkLabel} →
              </Link>
            )}
            <button
              onClick={() => setDismissed(d => [...d, notif.id])}
              className="text-slate-dim hover:text-white transition-colors flex-shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}

      {/* Show more / less toggle */}
      {visible.length > 1 && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 text-xs text-slate-dim hover:text-slate-mid transition-colors ml-1"
        >
          <Bell size={12} />
          {expanded
            ? <><ChevronUp size={12} /> Show less</>
            : <><ChevronDown size={12} /> {visible.length - 1} more notification{visible.length - 1 > 1 ? 's' : ''}</>
          }
        </button>
      )}
    </div>
  )
}
