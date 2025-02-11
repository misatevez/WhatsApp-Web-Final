"use client"

import Image from "next/image"
import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"

interface MessageProps {
  message: {
    id: string
    text: string
    isUser: boolean
    timestamp: number
  }
}

export function ChatMessage({ message }: MessageProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

  const isFile = message.text.startsWith("[File:")
  const fileMatch = isFile ? message.text.match(/\[File: (.*?)\]$$(.*?)$$/) : null
  const fileType = fileMatch ? fileMatch[1] : ""
  const fileUrl = fileMatch ? fileMatch[2] : ""

  const renderContent = () => {
    if (isFile) {
      if (fileType.startsWith("image/")) {
        return (
          <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
            <DialogTrigger asChild>
              <Image
                src={fileUrl || "/placeholder.svg"}
                alt="Uploaded image"
                width={200}
                height={200}
                className="cursor-pointer rounded-md"
              />
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <Image
                src={fileUrl || "/placeholder.svg"}
                alt="Uploaded image"
                width={800}
                height={600}
                className="w-full h-auto"
              />
            </DialogContent>
          </Dialog>
        )
      } else {
        return (
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            Download {fileType}
          </a>
        )
      }
    } else {
      return <p className="text-sm text-primary">{message.text}</p>
    }
  }

  return (
    <div className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[65%] rounded-lg px-4 py-2 ${message.isUser ? "bg-[#005c4b]" : "bg-sidebar"}`}>
        {renderContent()}
        <span className="text-xs text-muted-foreground float-right mt-1">{formattedTime}</span>
      </div>
    </div>
  )
}

