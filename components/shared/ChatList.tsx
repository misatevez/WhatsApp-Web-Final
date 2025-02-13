import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useAppContext } from "@/contexts/AppContext"
import { setSelectedChat } from "@/contexts/appActions"
import { storage, db } from "@/lib/firebase"
import { ref, getDownloadURL } from "firebase/storage"
import { collection, getDocs, writeBatch } from "firebase/firestore"
import { useEffect, useState } from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/contexts/ToastContext"
import type { Chat } from "@/types/interfaces"
import { DEFAULT_AVATAR } from "@/constants/constants"

function getDisplayTime(rawTimestamp: any): string {
  if (!rawTimestamp) return ""

  try {
    // Handle Firestore Timestamp
    if (typeof rawTimestamp === "object" && rawTimestamp !== null && "seconds" in rawTimestamp) {
      const milliseconds = rawTimestamp.seconds * 1000 + (rawTimestamp.nanoseconds || 0) / 1000000
      const date = new Date(milliseconds)
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
    }

    // Handle ISO string
    if (typeof rawTimestamp === "string") {
      const date = new Date(rawTimestamp)
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
      }
    }

    return ""
  } catch (error) {
    console.error("Error formatting timestamp:", error, { rawTimestamp })
    return ""
  }
}

function parseTimestampToNumber(rawTimestamp: any): number {
  if (!rawTimestamp) return 0

  try {
    // Handle Firestore Timestamp
    if (typeof rawTimestamp === "object" && rawTimestamp !== null && "seconds" in rawTimestamp) {
      return rawTimestamp.seconds * 1000 + (rawTimestamp.nanoseconds || 0) / 1000000
    }

    // Handle ISO string
    if (typeof rawTimestamp === "string") {
      const date = new Date(rawTimestamp)
      return isNaN(date.getTime()) ? 0 : date.getTime()
    }

    return 0
  } catch (error) {
    console.error("Error parsing timestamp:", error, { rawTimestamp })
    return 0
  }
}

interface ChatListProps {
  chats: Chat[]
  selectedChatId: string | null
}

export function ChatList({ chats, selectedChatId }: ChatListProps) {
  const { dispatch } = useAppContext()
  const { addToast } = useToast()
  const [avatarUrls, setAvatarUrls] = useState<{ [key: string]: string }>({})
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    const loadUserAvatars = async () => {
      const urls: { [key: string]: string } = {}

      for (const chat of chats) {
        if (chat.phoneNumber) {
          try {
            // Try to get user avatar from /users/{phoneNumber}/avatar path
            const avatarRef = ref(storage, `users/${chat.phoneNumber}/avatar`)
            const url = await getDownloadURL(avatarRef)
            urls[chat.phoneNumber] = url
          } catch (error) {
            // If no user avatar found, use existing avatar or default
            urls[chat.phoneNumber] = chat.userAvatar || chat.photoURL || chat.avatar || DEFAULT_AVATAR
          }
        }
      }

      setAvatarUrls(urls)
    }

    loadUserAvatars()
  }, [chats])

  const sortedChats = [...chats].sort((a, b) => {
    const aTime = parseTimestampToNumber(a.lastMessageUserTimestamp || a.lastMessageAdminTimestamp || a.timestamp)
    const bTime = parseTimestampToNumber(b.lastMessageUserTimestamp || b.lastMessageAdminTimestamp || b.timestamp)
    return bTime - aTime
  })

  const handleChatClick = (chatId: string) => {
    dispatch(setSelectedChat(chatId))
  }

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation() // Prevent chat selection when clicking delete

    if (isDeleting) return // Prevent multiple deletes at once

    try {
      setIsDeleting(chatId)

      // Delete all messages in the messages subcollection
      const messagesRef = collection(db, `chats/${chatId}/messages`)
      const messagesSnapshot = await getDocs(messagesRef)

      // Use batch to delete all messages
      const batch = writeBatch(db)
      messagesSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })
      await batch.commit()

      // If this was the selected chat, clear selection
      if (selectedChatId === chatId) {
        dispatch(setSelectedChat(null))
      }

      addToast({
        title: "Mensajes eliminados",
        description: "Se eliminó el historial de mensajes",
      })
    } catch (error) {
      console.error("Error deleting messages:", error)
      addToast({
        title: "Error",
        description: "No se pudo eliminar el historial de mensajes",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto relative z-20 bg-[#111b21] hover:overflow-y-auto">
      {sortedChats.map((chat) => {
        const displayName = chat.name || chat.phoneNumber
        const timestamp = chat.lastMessageUserTimestamp || chat.lastMessageAdminTimestamp || chat.timestamp
        const displayedTime = getDisplayTime(timestamp)
        const badgeCount = chat.unreadCount ?? 0
        const nameClass = badgeCount > 0 ? "text-white font-bold" : "text-[#e9edef] font-medium"
        const lastMessageClass = badgeCount > 0 ? "text-[#e9edef] font-bold" : "text-[#8696a0]"

        const avatarUrl = avatarUrls[chat.phoneNumber] || DEFAULT_AVATAR
        const lastMessage = chat.lastMessageUser || chat.lastMessageAdmin || chat.lastMessage || ""

        return (
          <div
            key={chat.id}
            onClick={() => handleChatClick(chat.id)}
            className={cn(
              "w-full flex items-center p-3 hover:bg-[#202c33] transition-colors cursor-pointer group",
              selectedChatId === chat.id && "bg-[#202c33]",
            )}
          >
            <Avatar className="h-12 w-12 mr-3">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex justify-between items-baseline">
                <div className="flex items-center gap-1">
                  <h3 className={cn("truncate text-base", nameClass)}>{displayName}</h3>
                  {chat.isBlocked && (
                    <span className="text-red-500" title="Usuario bloqueado">
                      🚫
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#8696a0]">{displayedTime}</span>
              </div>
              <div className="flex items-center gap-1">
                {chat.online && <div className="w-2 h-2 rounded-full bg-[#00a884]" />}
                <p className={cn("text-sm truncate flex-1", lastMessageClass)}>{lastMessage}</p>
                <div className="flex items-center gap-1 shrink-0">
                  {badgeCount > 0 && (
                    <span className="bg-[#00a884] text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
                      {badgeCount}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-[#8696a0] hover:text-red-500 hover:bg-[#182229] opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    disabled={isDeleting === chat.id}
                  >
                    {isDeleting === chat.id ? (
                      <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

