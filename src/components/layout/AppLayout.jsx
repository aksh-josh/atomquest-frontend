import Sidebar from './Sidebar'

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-ink-900">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}
