import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Zap, Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      if (user.role === 'ADMIN') navigate('/admin')
      else if (user.role === 'MANAGER') navigate('/manager')
      else navigate('/employee')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = (email, password) => {
    setForm({ email, password })
  }

  return (
    <div className="min-h-screen bg-ink-900 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-ink-800 border-r border-ink-600 p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-volt/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-info/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-volt rounded-xl flex items-center justify-center shadow-volt">
              <Zap size={20} className="text-ink-900" strokeWidth={2.5} />
            </div>
            <span className="font-display font-800 text-white text-xl">AtomQuest</span>
          </div>

          <h2 className="font-display font-800 text-4xl text-white leading-tight mb-4">
            Set goals.<br />
            Track progress.<br />
            <span className="text-volt">Win together.</span>
          </h2>
          <p className="text-slate-mid text-base leading-relaxed max-w-sm">
            A unified platform for employees, managers, and admins to align, track, and achieve annual performance goals.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { label: 'Goal Setting', desc: 'Define & weight KPIs' },
            { label: 'Quarterly Check-ins', desc: 'Track & update progress' },
            { label: 'Annual Review', desc: 'Score & evaluate results' },
          ].map((item) => (
            <div key={item.label} className="card p-4">
              <p className="font-display font-700 text-white text-sm mb-1">{item.label}</p>
              <p className="text-xs text-slate-dim">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md animate-slide-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-volt rounded-xl flex items-center justify-center shadow-volt">
              <Zap size={18} className="text-ink-900" strokeWidth={2.5} />
            </div>
            <span className="font-display font-800 text-white text-lg">AtomQuest</span>
          </div>

          <h1 className="font-display font-800 text-3xl text-white mb-2">Sign in</h1>
          <p className="text-slate-mid text-sm mb-8">Enter your credentials to access the portal</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-dim hover:text-slate-mid transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-ink-900 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-8">
            <p className="text-xs font-mono text-slate-dim uppercase tracking-widest mb-3">Demo Credentials</p>
            <div className="space-y-2">
              {[
                { role: 'Employee', email: 'employee@atomquest.com', pass: 'Employee@123', color: 'text-info' },
                { role: 'Manager', email: 'manager@atomquest.com', pass: 'Manager@123', color: 'text-warn' },
                { role: 'Admin', email: 'admin@atomquest.com', pass: 'Admin@123', color: 'text-volt' },
              ].map((d) => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => demoLogin(d.email, d.pass)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-ink-800 border border-ink-600 rounded-xl hover:border-ink-400 transition-all text-left group"
                >
                  <div>
                    <span className={`text-xs font-mono font-500 ${d.color}`}>{d.role}</span>
                    <p className="text-xs text-slate-dim mt-0.5">{d.email}</p>
                  </div>
                  <ArrowRight size={14} className="text-slate-dim group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
