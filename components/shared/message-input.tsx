"use client"

import { useState, type React } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import { EmojiPickerComponent } from "./emoji-picker"
import { AttachmentPicker } from "./attachment-picker"
import { DynamicStickerPicker } from "./dynamic-sticker-picker"
import { Textarea } from "@/components/ui/textarea"

interface MessageInputProps {
  chatId: string
  onSendMessage: (content: string, type: "text" | "image" | "document" | "sticker") => Promise<void>
}

export function MessageInput({ chatId, onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showAttachmentPicker, setShowAttachmentPicker] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  const isAdminRoute = pathname?.startsWith("/admin")

  const handleSendMessage = async () => {
    if (message.trim() && !isLoading) {
      setIsLoading(true)
      try {
        await onSendMessage(message.trim(), "text")
        setMessage("")
      } catch (error) {
        console.error("Error sending message:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const onEmojiSelect = (emojiData: any) => {
    const emoji = emojiData.emoji
    const input = document.getElementById("message-input") as HTMLTextAreaElement
    const cursorPos = input?.selectionStart || message.length
    const updatedMessage = message.slice(0, cursorPos) + emoji + message.slice(cursorPos)
    setMessage(updatedMessage)

    setTimeout(() => {
      input?.focus()
      const newCursorPos = cursorPos + emoji.length
      input?.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const handleFileSelect = async (content: string, type: "text" | "image" | "document") => {
    if (!isLoading) {
      setIsLoading(true)
      try {
        await onSendMessage(content, type)
      } catch (error) {
        console.error("Error sending file:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleStickerSelect = async (stickerUrl: string) => {
    if (!isLoading) {
      setIsLoading(true)
      try {
        await onSendMessage(stickerUrl, "sticker")
      } catch (error) {
        console.error("Error sending sticker:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="relative min-h-[62px] px-2 sm:px-4 w-full">
      {/* Background container with rounded corners */}
      <div className="absolute inset-0 bg-[#202c33]" />

      {/* Content wrapper */}
      <div className="relative flex items-center gap-1 sm:gap-2 h-[62px] px-1">
        <AttachmentPicker
          show={showAttachmentPicker}
          onToggle={() => setShowAttachmentPicker(!showAttachmentPicker)}
          onFileSelect={handleFileSelect}
          disabled={isLoading}
        />

        <EmojiPickerComponent
          showPicker={showEmojiPicker}
          onToggle={() => setShowEmojiPicker(!showEmojiPicker)}
          onEmojiSelect={onEmojiSelect}
          disabled={isLoading}
        />

        {isAdminRoute && (
          <DynamicStickerPicker
            onStickerSelect={handleStickerSelect}
            disabled={isLoading}
          />
        )}

        <div className="flex-1 min-w-0 px-1">
          <Textarea
            id="message-input"
            className="w-full bg-[#2a3942] text-[#d1d7db] placeholder:text-[#8696a0] border-none focus-visible:ring-0 h-10 sm:h-12 text-sm sm:text-base rounded-lg resize-none overflow-hidden"
            placeholder="Escribe un mensaje"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            rows={1}
            style={{ minHeight: "40px", maxHeight: "120px" }}
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-[#8696a0] hover:bg-[rgba(134,150,160,0.1)] h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0"
          onClick={handleSendMessage}
          disabled={isLoading || !message.trim()}
        >
          <Send className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div> 
    </div>
  );
}

