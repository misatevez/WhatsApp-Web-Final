"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { mockChats } from "@/lib/mockData"
import { useAuth } from "@/contexts/auth-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Chat {
  id: string
  name: string
  lastMessage: string
  timestamp: string
  avatar?: string
  photoURL?: string
}

export function ChatList() {
  const [chats, setChats] = useState<Chat[]>([])
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) return
    setChats(mockChats.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
  }, [user])

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`)
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#111b21]">
      {chats.map((chat) => (
        <div
          key={chat.id}
          className="flex items-center px-4 py-3 cursor-pointer hover:bg-[#2a3942] transition-colors"
          onClick={() => handleChatClick(chat.id)}
        >
          <Avatar className="h-12 w-12 mr-3">
            <AvatarImage src={chat.photoURL || chat.avatar || "/placeholder.svg"} alt={chat.name} />
            <AvatarFallback>{chat.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <h3 className="text-[#e9edef] text-base font-medium truncate">{chat.name}</h3>
              <span className="text-xs text-[#8696a0]">{chat.timestamp}</span>
            </div>
            <p className="text-sm text-[#8696a0] truncate">{chat.lastMessage}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

