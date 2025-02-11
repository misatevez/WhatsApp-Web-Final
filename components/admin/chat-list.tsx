"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Chat, ChatListProps } from "@/types/interfaces"

export function ChatList({ onSelectChat }: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>([])

  useEffect(() => {
    // Aquí iría la lógica para cargar los chats desde la base de datos
    // Por ahora, usaremos datos de ejemplo
    const exampleChats: Chat[] = [
      { id: "1", name: "Juan Pérez", lastMessage: "Hola, ¿cómo estás?", timestamp: Date.now() - 1000000 },
      { id: "2", name: "María García", lastMessage: "Gracias por la información", timestamp: Date.now() - 2000000 },
      { id: "3", name: "Carlos López", lastMessage: "¿Cuándo estará listo?", timestamp: Date.now() - 3000000 },
    ]
    setChats(exampleChats)
  }, [])

  return (
    <div className="w-96 bg-[#111b21] border-r border-[rgba(134,150,160,0.15)] overflow-y-auto">
      {chats.map((chat) => (
        <div
          key={chat.id}
          className="flex items-center p-4 cursor-pointer hover:bg-[#2a3942]"
          onClick={() => onSelectChat(chat.id)}
        >
          <Avatar className="h-12 w-12 mr-3">
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${chat.name}`} />
            <AvatarFallback>{chat.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <h3 className="text-[#e9edef] text-base font-medium truncate">{chat.name}</h3>
              <span className="text-xs text-[#8696a0]">
                {new Date(chat.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <p className="text-sm text-[#8696a0] truncate">{chat.lastMessage}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

