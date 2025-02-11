"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Phone, Video, MoreVertical, Smile, Paperclip, Mic, Send } from "lucide-react"
import type { Message, ChatViewProps } from "@/types/interfaces"

export function ChatView({ chatId }: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")

  useEffect(() => {
    // Aquí iría la lógica para cargar los mensajes desde la base de datos
    // Por ahora, usaremos datos de ejemplo
    const exampleMessages: Message[] = [
      { id: "1", text: "Hola, ¿cómo estás?", isAdmin: false, timestamp: Date.now() - 100000 },
      { id: "2", text: "Bien, gracias. ¿En qué puedo ayudarte?", isAdmin: true, timestamp: Date.now() - 90000 },
      { id: "3", text: "Tengo una pregunta sobre mi pedido", isAdmin: false, timestamp: Date.now() - 80000 },
    ]
    setMessages(exampleMessages)
  }, [])

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputMessage,
        isAdmin: true,
        timestamp: Date.now(),
      }
      setMessages([...messages, newMessage])
      setInputMessage("")
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0b141a]">
      <div className="h-16 bg-[#202c33] flex items-center justify-between px-4">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3">
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${chatId}`} />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-[#e9edef] text-base font-medium">Usuario {chatId}</h2>
            <p className="text-xs text-[#8696a0]">En línea</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-[#aebac1] hover:bg-[rgba(134,150,160,0.1)]">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-[#aebac1] hover:bg-[rgba(134,150,160,0.1)]">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-[#aebac1] hover:bg-[rgba(134,150,160,0.1)]">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4" style={{ backgroundImage: "url('/chat-background.png')" }}>
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isAdmin ? "justify-end" : "justify-start"} mb-4`}>
            <div className={`max-w-[65%] rounded-lg px-3 py-2 ${message.isAdmin ? "bg-[#005c4b]" : "bg-[#202c33]"}`}>
              <p className="text-[#e9edef] text-sm">{message.text}</p>
              <span className="text-[#8696a0] text-xs float-right mt-1">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="h-16 bg-[#202c33] flex items-center px-4 gap-2">
        <Button variant="ghost" size="icon" className="text-[#8696a0] hover:bg-[rgba(134,150,160,0.1)]">
          <Smile className="h-6 w-6" />
        </Button>
        <Button variant="ghost" size="icon" className="text-[#8696a0] hover:bg-[rgba(134,150,160,0.1)]">
          <Paperclip className="h-6 w-6" />
        </Button>
        <Input
          className="flex-1 bg-[#2a3942] text-[#d1d7db] placeholder-[#8696a0] border-none"
          placeholder="Escribe un mensaje"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        {inputMessage.trim() ? (
          <Button
            variant="ghost"
            size="icon"
            className="text-[#8696a0] hover:bg-[rgba(134,150,160,0.1)]"
            onClick={handleSendMessage}
          >
            <Send className="h-6 w-6" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="text-[#8696a0] hover:bg-[rgba(134,150,160,0.1)]">
            <Mic className="h-6 w-6" />
          </Button>
        )}
      </div>
    </div>
  )
}

