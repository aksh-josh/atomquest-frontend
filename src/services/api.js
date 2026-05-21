import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'https://atomquest-backend-g9l8.onrender.com'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aq_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('aq_token')
      localStorage.removeItem('aq_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  me: () => api.get('/api/auth/me'),
  changePassword: (data) => api.put('/api/auth/change-password', data),
  register: (data) => api.post('/api/auth/register', data),
}

// ─── GOALS ───────────────────────────────────────────────────────────────────
export const goalsAPI = {
  getMySheet: () => api.get('/api/goals/my-sheet'),
  saveGoals: (goals) => api.post('/api/goals/save', { goals }),
  submit: () => api.post('/api/goals/submit'),
  updateAchievement: (goalId, data) => api.post(`/api/goals/${goalId}/achievement`, data),
  getTeamSheets: (params) => api.get('/api/goals/team', { params }),
  approveSheet: (sheetId, data) => api.put(`/api/goals/${sheetId}/approve`, data),
  rejectSheet: (sheetId, data) => api.put(`/api/goals/${sheetId}/reject`, data),
  inlineEdit: (sheetId, goals) => api.put(`/api/goals/${sheetId}/inline-edit`, { goals }),
  pushShared: (data) => api.post('/api/goals/push-shared', data),
  getThrustAreas: () => api.get('/api/goals/thrust-areas'),
  getCycles: () => api.get('/api/goals/cycles'),
}

// ─── CHECK-INS ───────────────────────────────────────────────────────────────
export const checkinsAPI = {
  submitCheckIn: (sheetId, data) => api.post(`/api/checkins/${sheetId}`, data),
  getTeamCheckIns: () => api.get('/api/checkins/team'),
  getMyCheckIns: () => api.get('/api/checkins/my'),
}

// ─── ADMIN ───────────────────────────────────────────────────────────────────
export const adminAPI = {
  getUsers: (params) => api.get('/api/admin/users', { params }),
  createUser: (data) => api.post('/api/admin/users', data),
  updateUser: (id, data) => api.put(`/api/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`),
  getCycles: () => api.get('/api/admin/cycles'),
  createCycle: (data) => api.post('/api/admin/cycles', data),
  activateCycle: (id) => api.put(`/api/admin/cycles/${id}/activate`),
  createThrustArea: (data) => api.post('/api/admin/thrust-areas', data),
  unlockGoalSheet: (sheetId, data) => api.put(`/api/admin/goals/${sheetId}/unlock`, data),
  getAuditLogs: (params) => api.get('/api/admin/audit-logs', { params }),
  getCompletionDashboard: () => api.get('/api/admin/completion-dashboard'),
}

// ─── REPORTS ─────────────────────────────────────────────────────────────────
export const reportsAPI = {
  getAchievement: (params) => api.get('/api/reports/achievement', { params }),
  downloadCSV: () => api.get('/api/reports/achievement', { params: { format: 'csv' }, responseType: 'blob' }),
  getCompletion: () => api.get('/api/reports/completion'),
  getLeaderboard: () => api.get('/api/reports/leaderboard'),
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const notificationsAPI = {
  get: () => api.get('/api/notifications'),
}

export default api
