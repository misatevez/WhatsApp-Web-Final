"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, CheckCheck } from "lucide-react"
import { ThumbnailPreview } from "./thumbnail-preview"
import { formatTimestamp } from "@/lib/utils"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Message } from "@/types/interfaces"

// URL detection regex pattern
const URL_PATTERN = /(?:https?:\/\/)?(?:www\.)?([^\s<]+\.[^\s<]+)/gi

// Function to convert URLs to clickable links
const convertUrlsToLinks = (text: string) => {
  const parts = text.split(URL_PATTERN)
  const matches = text.match(URL_PATTERN)

  if (!matches) return text

  const result = []
  let i = 0

  matches.forEach((url, index) => {
    // Add text before URL
    if (parts[i]) {
      result.push(parts[i])
    }

    // Add URL as link
    const fullUrl = url.startsWith("http") ? url : `https://${url}`
    result.push(
      <a
        key={index}
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#53bdeb] underline hover:text-[#7ccbf0]"
        onClick={(e) => e.stopPropagation()}
      >
        {url}
      </a>,
    )
    i += 2
  })

  // Add remaining text
  if (parts[i]) {
    result.push(parts[i])
  }

  return <>{result}</>
}

interface MessageListProps {
  messages: Message[]
  currentUserId: string
  chatSearchQuery?: string
  chatId: string
  lastReadMessageId?: string
  invertOutgoing?: boolean
  lastMessageUserTimestamp?: string | null
  lastReadByAdmin?: any
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
  }: MessageListProps) => {
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    // Subscribe to real-time message updates
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
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [])

    // Helper function to safely convert timestamp to milliseconds
    const getTimestampMillis = useCallback((timestamp: any): number => {
      if (!timestamp) return 0

      // Handle Firestore Timestamp object
      if (timestamp && typeof timestamp === "object" && "seconds" in timestamp) {
        return timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000
      }

      // Handle ISO string
      if (typeof timestamp === "string") {
        const date = new Date(timestamp)
        return isNaN(date.getTime()) ? 0 : date.getTime()
      }

      // Handle Date object
      if (timestamp instanceof Date) {
        return timestamp.getTime()
      }

      return 0
    }, [])

    const handleImageClick = (imageUrl: string) => {
      setSelectedImage(imageUrl)
    }

    const filteredMessages = chatSearchQuery
      ? messages.filter((m) => m.content.toLowerCase().includes(chatSearchQuery.toLowerCase()))
      : messages

    const renderMessageStatus = useCallback(
      (message: Message, isRightSide: boolean) => {
        if (!isRightSide) return null

        try {
          const messageTimestamp = getTimestampMillis(message.timestamp)
          const userResponseTimestamp = getTimestampMillis(lastMessageUserTimestamp)
          const adminReadTimestamp = getTimestampMillis(lastReadByAdmin)

          const isAdmin = currentUserId === "admin"

          // For admin messages (isOutgoing = true)
          if (isAdmin && message.isOutgoing) {
            // Message is marked as read if there's a user response after it
            const hasUserResponse = userResponseTimestamp > messageTimestamp

            // Start with gray checkmarks, turn blue when read
            const checkmarkColor = message.status === "read" || hasUserResponse ? "text-[#53bdeb]" : "text-[#8696a0]"

            return <CheckCheck className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${checkmarkColor}`} />
          }

          // For user messages (isOutgoing = false)
          if (!isAdmin && !message.isOutgoing) {
            // Message is marked as read if admin has read it after it was sent
            const hasBeenRead = adminReadTimestamp > messageTimestamp

            // Start with gray checkmarks, turn blue when read
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
                  className={`max-w-[85%] sm:max-w-[65%] rounded-lg px-2 py-1.5 sm:px-3 sm:py-2 ${bubbleColorClass} ${
                    chatSearchQuery ? "bg-[#0b3d36]" : ""
                  }`}
                >
                  {message.type === "text" ? (
                    <p className="text-sm sm:text-base text-[#e9edef] whitespace-pre-wrap">
                      {convertUrlsToLinks(message.content)}
                    </p>
                  ) : (
                    <ThumbnailPreview
                      content={message.content}
                      type={message.type}
                      filename={message.filename}
                      onImageClick={handleImageClick}
                    />
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

        {/* Image Preview Dialog */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="bg-[#111b21] border-none text-[#e9edef] max-w-4xl p-0">
            <DialogHeader className="bg-[#202c33] px-4 py-3 flex-row items-center justify-between">
              <DialogTitle>Vista previa</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedImage(null)}
                className="text-[#aebac1] hover:text-[#e9edef]"
              >
                <X className="h-5 w-5" />
              </Button>
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

