import Sidebar from './Sidebar'
import OnboardingGuide from '../ui/OnboardingGuide'
import NotificationBanner from '../ui/NotificationBanner'

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-ink-900">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <NotificationBanner />
        <div className="max-w-6xl mx-auto p-8 animate-fade-in">
          {children}
        </div>
      </main>
      <OnboardingGuide />
    </div>
  )
}
