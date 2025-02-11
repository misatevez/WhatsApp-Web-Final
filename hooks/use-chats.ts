"use client"

import { useState, useEffect } from "react"
import { ref, onValue } from "firebase/database"
import { database } from "@/lib/firebase"
import type { Chat } from "@/types/interfaces"

// interface Chat {
//   id: string
//   name: string
//   lastMessage: string
//   timestamp: number
// }

export function useChats(userId: string) {
  const [chats, setChats] = useState<Chat[]>([])

  useEffect(() => {
    const chatsRef = ref(database, `users/${userId}/chats`)
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const chatList = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
        }))
        setChats(chatList)
      }
    })

    return () => unsubscribe()
  }, [userId])

  return chats
}

