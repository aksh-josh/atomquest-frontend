import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import LoginPage from './pages/auth/LoginPage'
import EmployeeDashboard from './pages/employee/Dashboard'
import EmployeeGoals from './pages/employee/Goals'
import EmployeeCheckIns from './pages/employee/CheckIns'
import ManagerDashboard from './pages/manager/Dashboard'
import ManagerTeam from './pages/manager/Team'
import ManagerCheckIns from './pages/manager/CheckIns'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminCycles from './pages/admin/Cycles'
import AdminAuditLogs from './pages/admin/AuditLogs'

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-ink-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-volt border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-mid font-mono text-sm">Loading AtomQuest...</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={getDefaultRoute(user.role)} replace />
  return children
}

const getDefaultRoute = (role) => {
  if (role === 'ADMIN') return '/admin'
  if (role === 'MANAGER') return '/manager'
  return '/employee'
}

const RoleRedirect = () => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={getDefaultRoute(user.role)} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RoleRedirect />} />

        {/* Employee */}
        <Route path="/employee" element={<ProtectedRoute roles={['EMPLOYEE']}><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="/employee/goals" element={<ProtectedRoute roles={['EMPLOYEE']}><EmployeeGoals /></ProtectedRoute>} />
        <Route path="/employee/checkins" element={<ProtectedRoute roles={['EMPLOYEE']}><EmployeeCheckIns /></ProtectedRoute>} />

        {/* Manager */}
        <Route path="/manager" element={<ProtectedRoute roles={['MANAGER']}><ManagerDashboard /></ProtectedRoute>} />
        <Route path="/manager/team" element={<ProtectedRoute roles={['MANAGER']}><ManagerTeam /></ProtectedRoute>} />
        <Route path="/manager/checkins" element={<ProtectedRoute roles={['MANAGER']}><ManagerCheckIns /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/cycles" element={<ProtectedRoute roles={['ADMIN']}><AdminCycles /></ProtectedRoute>} />
        <Route path="/admin/audit" element={<ProtectedRoute roles={['ADMIN']}><AdminAuditLogs /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
