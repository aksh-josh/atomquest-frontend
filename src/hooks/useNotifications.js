import { useState, useEffect, useCallback } from 'react'
import { notificationsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export function useNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [badges, setBadges] = useState({})
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await notificationsAPI.get()
      setNotifications(res.data.notifications || [])
      setBadges(res.data.badges || {})
    } catch {
      // silent fail - notifications are non-critical
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetch()
    // Poll every 60 seconds
    const interval = setInterval(fetch, 60000)
    return () => clearInterval(interval)
  }, [fetch])

  const totalBadge = Object.values(badges).reduce((s, v) => s + (v || 0), 0)

  return { notifications, badges, loading, totalBadge, refetch: fetch }
}
