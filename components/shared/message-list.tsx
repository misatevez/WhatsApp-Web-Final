"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { usePathname } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, CheckCheck, Plus } from "lucide-react"
import { ThumbnailPreview } from "./thumbnail-preview"
import { formatTimestamp } from "@/lib/utils"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { uploadSticker } from "@/lib/firestore/stickers"
import type { Message } from "@/types/interfaces"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const URL_PATTERN = /(?:https?:\/\/)?(?:www\.)?([^\s<]+\.[^\s<]+)/gi

const convertUrlsToLinks = (text: string) => text

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  chatSearchQuery?: string
  chatId: string
  lastReadMessageId?: string
  invertOutgoing?: boolean
  lastMessageUserTimestamp?: string | null
  lastReadByAdmin?: any
  scrollToBottom: boolean
}

export const MessageList = React.memo(
  ({
    messages: initialMessages,
    currentUserId,
    chatSearchQuery,
    chatId,
    lastReadMessageId,
    invertOutgoing = false,
    lastMessageUserTimestamp,
    lastReadByAdmin,
    scrollToBottom,
  }: MessageListProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const pathname = usePathname()
    const isAdminRoute = pathname?.startsWith("/admin")

    useEffect(() => {
      if (!chatId) return

      console.log("Setting up real-time messages subscription for chat:", chatId)

      const messagesRef = collection(db, `chats/${chatId}/messages`)
      const q = query(messagesRef, orderBy("timestamp", "asc"))

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const updatedMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[]

        setMessages(updatedMessages)
      })

      return () => unsubscribe()
    }, [chatId])

    useEffect(() => {
      if (scrollToBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }
    }, [scrollToBottom])

    const getTimestampMillis = useCallback((timestamp: any): number => {
      if (!timestamp) return 0

      if (timestamp && typeof timestamp === "object" && "seconds" in timestamp) {
        return timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000
      }

      if (typeof timestamp === "string") {
        const date = new Date(timestamp)
        return isNaN(date.getTime()) ? 0 : date.getTime()
      }

      if (timestamp instanceof Date) {
        return timestamp.getTime()
      }

      return 0
    }, [])

    const handleImageClick = (imageUrl: string) => {
      setSelectedImage(imageUrl)
    }

    const handleAddSticker = async (imageUrl: string) => {
      if (isAdminRoute) {
        try {
          const response = await fetch(imageUrl)
          const blob = await response.blob()
          const file = new File([blob], "sticker.webp", { type: "image/webp" })
          await uploadSticker("default", file)
          console.log("Sticker added successfully")
        } catch (error) {
          console.error("Error adding sticker:", error)
        }
      }
    }

    const filteredMessages = chatSearchQuery
      ? messages.filter((m) =>
          m.type === "text" ? m.content.toLowerCase().includes(chatSearchQuery.toLowerCase()) : false,
        )
      : messages

    const renderMessageStatus = useCallback(
      (message: Message, isRightSide: boolean) => {
        if (!isRightSide) return null

        try {
          const messageTimestamp = getTimestampMillis(message.timestamp)
          const userResponseTimestamp = getTimestampMillis(lastMessageUserTimestamp)
          const adminReadTimestamp = getTimestampMillis(lastReadByAdmin)

          const isAdmin = currentUserId === "admin"

          if (isAdmin && message.isOutgoing) {
            const hasUserResponse = userResponseTimestamp > messageTimestamp

            const checkmarkColor = message.status === "read" || hasUserResponse ? "text-[#53bdeb]" : "text-[#8696a0]"

            return <CheckCheck className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${checkmarkColor}`} />
          }

          if (!isAdmin && !message.isOutgoing) {
            const hasBeenRead = adminReadTimestamp > messageTimestamp

            const checkmarkColor = message.status === "read" || hasBeenRead ? "text-[#53bdeb]" : "text-[#8696a0]"

            return <CheckCheck className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${checkmarkColor}`} />
          }
        } catch (error) {
          console.error("Error processing message timestamp:", error)
        }

        return null
      },
      [currentUserId, lastMessageUserTimestamp, lastReadByAdmin, getTimestampMillis],
    )

    return (
      <>
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4 scrollbar-thin scrollbar-thumb-[rgba(17,27,33,0.4)] scrollbar-track-transparent hover:scrollbar-thumb-[rgba(17,27,33,0.6)]">
          {filteredMessages.map((message) => {
            const isRightSide = invertOutgoing ? !message.isOutgoing : message.isOutgoing
            const alignmentClass = isRightSide ? "justify-end" : "justify-start"
            const bubbleColorClass = isRightSide ? "bg-[#005c4b]" : "bg-[#202c33]"

            return (
              <div key={message.id} className={`flex ${alignmentClass} mb-2 sm:mb-4`}>
                <div
                  className={`max-w-[85%] sm:max-w-[65%] rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 ${
                    message.type === "sticker" ? "" : bubbleColorClass
                  } ${chatSearchQuery ? "bg-[#0b3d36]" : ""}`}
                >
                  {message.type === "text" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ node, ...props }) => (
                          <a
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#53bdeb] underline hover:text-[#7ccbf0]"
                            {...props}
                          />
                        ),
                      }}
                      className="text-sm sm:text-base text-[#e9edef] whitespace-pre-wrap break-words"
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : message.type === "sticker" ? (
                    <img
                      src={message.content || "/placeholder.svg"}
                      alt="Sticker"
                      className="w-32 h-32 object-contain"
                    />
                  ) : (
                    <div className="relative group">
                      <ThumbnailPreview
                        content={message.content}
                        type={message.type}
                        filename={message.filename}
                        onImageClick={handleImageClick}
                      />
                      {isAdminRoute && message.type === "image" && message.content.endsWith(".webp") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-[rgba(0,0,0,0.5)] text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleAddSticker(message.content)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-1 mt-0.5 sm:mt-1">
                    <span className="text-[10px] sm:text-xs text-[#8696a0]">{formatTimestamp(message.timestamp)}</span>
                    {renderMessageStatus(message, isRightSide)}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="bg-[#111b21] border-none text-[#e9edef] max-w-4xl p-0">
            <DialogHeader className="bg-[#202c33] px-4 py-3 flex-row items-center justify-between">
              <DialogTitle>Vista previa</DialogTitle>
              <div className="flex items-center space-x-2">
                {isAdminRoute && selectedImage?.endsWith(".webp") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (selectedImage) handleAddSticker(selectedImage)
                    }}
                    className="text-[#00a884] hover:text-[#00a884] hover:bg-[rgba(0,168,132,0.1)]"
                  >
                    Agregar como sticker
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedImage(null)}
                  className="text-[#aebac1] hover:text-[#e9edef]"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </DialogHeader>
            {selectedImage && (
              <div className="relative aspect-auto max-h-[80vh] w-full">
                <img
                  src={selectedImage || "/placeholder.svg"}
                  alt="Vista previa"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    )
  },
)

MessageList.displayName = "MessageList"

