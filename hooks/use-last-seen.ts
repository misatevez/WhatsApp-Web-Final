"use client"

import { useState, useEffect } from "react"
import { ref, onValue, set } from "firebase/database"
import { database } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"

export function useLastSeen() {
  const { user } = useAuth()
  const [lastSeen, setLastSeen] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    if (!user) return

    const lastSeenRef = ref(database, "lastSeen")
    const unsubscribe = onValue(lastSeenRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        setLastSeen(data)
      }
    })

    // Update user's last seen
    const userLastSeenRef = ref(database, `lastSeen/${user.uid}`)
    set(userLastSeenRef, Date.now())

    // Update last seen every minute while online
    const interval = setInterval(() => {
      set(userLastSeenRef, Date.now())
    }, 60000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [user])

  const getLastSeen = (userId: string) => {
    const lastSeenTime = lastSeen[userId]
    if (!lastSeenTime) return "Offline"

    const now = Date.now()
    const diff = now - lastSeenTime

    if (diff < 60000) return "Online"
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`
    return new Date(lastSeenTime).toLocaleDateString()
  }

  return { getLastSeen }
}

