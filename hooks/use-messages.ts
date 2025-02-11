"use client"

import { useState, useEffect } from "react"
import { ref, onValue, push, serverTimestamp } from "firebase/database"
import { database } from "@/lib/firebase"
import type { UseMessagesMessage } from "@/types/interfaces"

export function useMessages(chatId: string) {
  const [messages, setMessages] = useState<UseMessagesMessage[]>([])

  useEffect(() => {
    const messagesRef = ref(database, `chats/${chatId}/messages`)
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const messageList = Object.entries(data).map(([key, value]: [string, any]) => ({
          id: key,
          ...value,
          text: value.text,
        }))
        setMessages(messageList)
      }
    })

    return () => unsubscribe()
  }, [chatId])

  const sendMessage = async (text: string, userId: string) => {
    const messagesRef = ref(database, `chats/${chatId}/messages`)
    await push(messagesRef, {
      text,
      userId,
      timestamp: serverTimestamp(),
    })
  }

  return { messages, sendMessage }
}

