import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Target, CheckSquare, Users, Settings,
  BookOpen, BarChart3, LogOut, Zap, ChevronRight
} from 'lucide-react'

const navByRole = {
  EMPLOYEE: [
    { to: '/employee', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/employee/goals', label: 'My Goals', icon: Target },
    { to: '/employee/checkins', label: 'Check-ins', icon: CheckSquare },
  ],
  MANAGER: [
    { to: '/manager', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/manager/team', label: 'Team Goals', icon: Users },
    { to: '/manager/checkins', label: 'Check-ins', icon: CheckSquare },
  ],
  ADMIN: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/cycles', label: 'Cycles', icon: Settings },
    { to: '/admin/audit', label: 'Audit Logs', icon: BookOpen },
  ],
}

const roleColors = {
  EMPLOYEE: 'text-info',
  MANAGER: 'text-warn',
  ADMIN: 'text-volt',
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const nav = navByRole[user?.role] || []

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-64 min-h-screen bg-ink-800 border-r border-ink-600 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-ink-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-volt rounded-xl flex items-center justify-center shadow-volt">
            <Zap size={18} className="text-ink-900" strokeWidth={2.5} />
          </div>
          <div>
            <p className="font-display font-800 text-white text-lg leading-none">AtomQuest</p>
            <p className="text-xs text-slate-dim font-mono mt-0.5">Goal Portal</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-ink-600">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-ink-600 rounded-xl flex items-center justify-center">
            <span className="font-display font-700 text-volt text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-body font-500 text-white truncate">{user?.name}</p>
            <p className={`text-xs font-mono ${roleColors[user?.role]}`}>{user?.role}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 group ${
                isActive
                  ? 'bg-volt text-ink-900 font-display font-700 shadow-volt'
                  : 'text-slate-mid hover:text-white hover:bg-ink-700'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={17} strokeWidth={isActive ? 2.5 : 2} />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={14} strokeWidth={2.5} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-ink-600">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-mid hover:text-danger hover:bg-danger/10 transition-all duration-200"
        >
          <LogOut size={17} strokeWidth={2} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}
