import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { X, ArrowRight, ArrowLeft, Zap, CheckCircle } from 'lucide-react'

// Steps per role
const STEPS = {
  ADMIN: [
    {
      title: 'Welcome to AtomQuest! 👋',
      description: 'You\'re logged in as Admin. This quick guide will show you how to manage the portal. It takes less than a minute!',
      highlight: null,
      emoji: '🚀',
    },
    {
      title: 'Admin Dashboard',
      description: 'This is your command center. You can see how many employees have submitted, approved, or are still in draft. The charts update in real time.',
      highlight: 'dashboard',
      emoji: '📊',
      tip: 'Use "Export CSV" button on this page to download the full achievement report anytime.',
    },
    {
      title: 'User Management',
      description: 'Click "Users" in the sidebar to add, edit, or delete employees and managers. You can assign each employee to their reporting manager here.',
      highlight: 'users',
      emoji: '👥',
      tip: 'Always assign a Manager to each Employee so they can approve their goals.',
    },
    {
      title: 'Cycles & Thrust Areas',
      description: 'Click "Cycles" to create a new goal cycle (e.g. FY 2025-26), set its phase, and activate it. You can also add Thrust Areas that employees choose from.',
      highlight: 'cycles',
      emoji: '🔄',
      tip: 'Only ONE cycle can be active at a time. Activating a new one deactivates the old one.',
    },
    {
      title: 'Audit Logs',
      description: 'Every action — approvals, rejections, edits, unlocks — is recorded here with timestamp and actor. Perfect for compliance and review.',
      highlight: 'audit',
      emoji: '📋',
    },
    {
      title: 'You\'re all set! ✅',
      description: 'Start by creating your team in Users, then create & activate a Cycle. Employees can then log in and set their goals.',
      highlight: null,
      emoji: '🎉',
      tip: 'Demo users are already seeded: employee@atomquest.com, manager@atomquest.com',
    },
  ],
  MANAGER: [
    {
      title: 'Welcome, Manager! 👋',
      description: 'You can review your team\'s goals, approve or return them, and log quarterly check-ins. Let\'s get you familiar with the portal.',
      highlight: null,
      emoji: '🚀',
    },
    {
      title: 'Your Dashboard',
      description: 'Your dashboard shows you a bird\'s eye view — how many team members have submitted goals, who\'s approved, and who needs attention.',
      highlight: 'dashboard',
      emoji: '📊',
      tip: 'Red "Pending Review" count means someone is waiting for your approval!',
    },
    {
      title: 'Team Goals — Approve or Return',
      description: 'Click "Team Goals" in the sidebar. Expand any employee\'s card to see their goals in detail. You can Approve ✅ or Return for Rework ↩.',
      highlight: 'team',
      emoji: '🎯',
      tip: 'You must provide a reason when returning a sheet. The employee will see your feedback.',
    },
    {
      title: 'Quarterly Check-ins',
      description: 'Click "Check-ins" to log a quarterly note for each team member after your 1-on-1 meetings. This tracks progress across Q1, Q2, Q3, and Annual.',
      highlight: 'checkins',
      emoji: '💬',
      tip: 'Check-ins are only available after goals are approved. Approve first!',
    },
    {
      title: 'You\'re all set! ✅',
      description: 'Start by reviewing any submitted goal sheets in "Team Goals". Your team is counting on your timely feedback.',
      highlight: null,
      emoji: '🎉',
    },
  ],
  EMPLOYEE: [
    {
      title: 'Welcome to AtomQuest! 👋',
      description: 'This portal helps you define, submit, and track your annual performance goals. Let\'s walk you through the key sections.',
      highlight: null,
      emoji: '🚀',
    },
    {
      title: 'Your Dashboard',
      description: 'Your dashboard shows your overall score, goal sheet status, and check-in history at a glance. Everything you need in one view.',
      highlight: 'dashboard',
      emoji: '📊',
      tip: 'If your status shows "Not submitted", head to My Goals to set your goals!',
    },
    {
      title: 'Setting Your Goals',
      description: 'Click "My Goals" in the sidebar. Add up to 8 goals, each with a Thrust Area, Unit of Measurement, Target, and Weightage. Total weightage MUST equal 100%.',
      highlight: 'goals',
      emoji: '🎯',
      tip: 'Minimum 10% weightage per goal. Save as Draft anytime, submit when ready.',
    },
    {
      title: 'Units of Measurement (UoM)',
      description: '↑ Higher Better (e.g. Revenue), ↓ Lower Better (e.g. TAT), % variants, Timeline (date-based), or Zero-based (0 incidents = perfect score).',
      highlight: 'goals',
      emoji: '📏',
      tip: 'Choose carefully — UoM determines how your score is calculated!',
    },
    {
      title: 'Submitting & Approval',
      description: 'Once happy with your goals, click "Submit for Approval". Your manager will review and either Approve or Return with feedback.',
      highlight: 'goals',
      emoji: '📤',
      tip: 'If rejected, your manager\'s feedback will appear in red. Edit and resubmit!',
    },
    {
      title: 'Logging Achievements',
      description: 'After your goals are approved, come back to "My Goals" and click "Log Achievement" on each goal after each quarter to record your actual progress.',
      highlight: 'goals',
      emoji: '✍️',
    },
    {
      title: 'Check-ins',
      description: 'After each quarterly meeting with your manager, they\'ll log a check-in note. You can view all check-in history under "Check-ins".',
      highlight: 'checkins',
      emoji: '💬',
    },
    {
      title: 'You\'re all set! ✅',
      description: 'Start by going to "My Goals" and setting your goals for this cycle. Good luck! 🌟',
      highlight: null,
      emoji: '🎉',
    },
  ],
}

const STORAGE_KEY = (role) => `aq_onboarded_${role}`

export default function OnboardingGuide() {
  const { user } = useAuth()
  const [visible, setVisible] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!user) return
    const done = localStorage.getItem(STORAGE_KEY(user.role))
    if (!done) {
      // Small delay so the page renders first
      setTimeout(() => setVisible(true), 800)
    }
  }, [user])

  const steps = STEPS[user?.role] || []
  const current = steps[step]
  const isLast = step === steps.length - 1
  const isFirst = step === 0

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY(user.role), 'true')
    setVisible(false)
  }

  const handleNext = () => {
    if (isLast) {
      handleClose()
    } else {
      setStep(s => s + 1)
    }
  }

  const handlePrev = () => setStep(s => s - 1)

  if (!visible || !current) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={handleClose}>
        {/* Modal */}
        <div
          className="relative w-full max-w-md bg-ink-800 border border-ink-500 rounded-3xl shadow-card animate-slide-up overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-volt via-volt-light to-info" />

          {/* Progress dots */}
          <div className="flex items-center justify-between px-6 pt-5">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? 'w-6 bg-volt' : i < step ? 'w-3 bg-volt/40' : 'w-3 bg-ink-600'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={handleClose}
              className="w-7 h-7 rounded-lg bg-ink-700 hover:bg-ink-600 flex items-center justify-center text-slate-dim hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {/* Emoji */}
            <div className="text-4xl mb-4">{current.emoji}</div>

            {/* Step counter */}
            <p className="text-xs font-mono text-slate-dim uppercase tracking-widest mb-2">
              Step {step + 1} of {steps.length}
            </p>

            {/* Title */}
            <h2 className="font-display font-800 text-white text-xl mb-3 leading-tight">
              {current.title}
            </h2>

            {/* Description */}
            <p className="text-slate-mid text-sm leading-relaxed mb-4">
              {current.description}
            </p>

            {/* Tip box */}
            {current.tip && (
              <div className="flex gap-3 p-3 bg-volt/8 border border-volt/20 rounded-xl mb-4">
                <span className="text-volt mt-0.5 flex-shrink-0">💡</span>
                <p className="text-xs text-volt/90 leading-relaxed">{current.tip}</p>
              </div>
            )}

            {/* Where to click hint */}
            {current.highlight && (
              <div className="flex items-center gap-2 p-2.5 bg-ink-700 rounded-xl mb-4 border border-ink-500">
                <div className="w-2 h-2 rounded-full bg-volt animate-pulse" />
                <p className="text-xs text-slate-mid">
                  Look for <span className="text-white font-500">
                    {current.highlight === 'dashboard' && '"Dashboard" in the left sidebar'}
                    {current.highlight === 'users' && '"Users" in the left sidebar'}
                    {current.highlight === 'cycles' && '"Cycles" in the left sidebar'}
                    {current.highlight === 'audit' && '"Audit Logs" in the left sidebar'}
                    {current.highlight === 'team' && '"Team Goals" in the left sidebar'}
                    {current.highlight === 'checkins' && '"Check-ins" in the left sidebar'}
                    {current.highlight === 'goals' && '"My Goals" in the left sidebar'}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center gap-3 px-6 pb-6">
            {!isFirst && (
              <button onClick={handlePrev} className="btn-secondary flex items-center gap-2 flex-shrink-0">
                <ArrowLeft size={15} /> Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isLast ? (
                <><CheckCircle size={16} /> Get Started!</>
              ) : (
                <>Next <ArrowRight size={15} /></>
              )}
            </button>
          </div>

          {/* Skip link */}
          {!isLast && (
            <div className="text-center pb-4">
              <button onClick={handleClose} className="text-xs text-slate-dim hover:text-slate-mid transition-colors underline underline-offset-2">
                Skip guide
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
