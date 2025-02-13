import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useAppContext } from "@/contexts/AppContext"
import { setSelectedChat, updateChat } from "@/contexts/appActions"
import type { Chat } from "@/types/interfaces"

const DEFAULT_AVATAR =
  "https://firebasestorage.googleapis.com/v0/b/cargatusfichas.firebasestorage.app/o/admin%2Favatar.png?alt=media&token=54132d01-d241-429a-b131-1be8951406b7"

function getDisplayTime(rawTimestamp: any): string {
  if (!rawTimestamp) return "Invalid Date"
  if (typeof rawTimestamp === "string") {
    const timePattern = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
    const match = rawTimestamp.match(timePattern)
    if (match) {
      const hh = Number.parseInt(match[1], 10)
      const mm = Number.parseInt(match[2], 10)
      const ss = match[3] ? Number.parseInt(match[3], 10) : 0
      const now = new Date()
      now.setHours(hh, mm, ss, 0)
      return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  }
  const dateObj = new Date(rawTimestamp)
  if (!isNaN(dateObj.getTime())) {
    return dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }
  return "Invalid Date"
}

function parseTimestampToNumber(rawTimestamp: any): number {
  if (!rawTimestamp) return 0
  if (typeof rawTimestamp === "string") {
    const timePattern = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/
    const match = rawTimestamp.match(timePattern)
    if (match) {
      const hh = Number.parseInt(match[1], 10)
      const mm = Number.parseInt(match[2], 10)
      const ss = match[3] ? Number.parseInt(match[3], 10) : 0
      const now = new Date()
      now.setHours(hh, mm, ss, 0)
      return now.getTime()
    }
  }
  const dateObj = new Date(rawTimestamp)
  if (!isNaN(dateObj.getTime())) {
    return dateObj.getTime()
  }
  return 0
}

interface ChatListProps {
  chats: Chat[]
  selectedChatId: string | null
}

export function ChatList({ chats, selectedChatId }: ChatListProps) {
  const { dispatch } = useAppContext()

  const sortedChats = [...chats].sort((a, b) => {
    const aTime = parseTimestampToNumber(a.lastMessageUserTimestamp || a.timestamp)
    const bTime = parseTimestampToNumber(b.lastMessageUserTimestamp || b.timestamp)
    return bTime - aTime
  })

  const handleChatClick = (chatId: string) => {
    dispatch(
      updateChat({
        id: chatId,
        unreadCount: 0,
        lastReadByAdmin: new Date().toISOString(),
      }),
    )
    dispatch(setSelectedChat(chatId))
  }

  return (
    <div className="flex-1 overflow-y-auto relative z-20 bg-[#111b21]">
      {sortedChats.map((chat) => {
        const displayName = chat.name || chat.phoneNumber
        const lastMsgContent = chat.lastMessageUser || chat.lastMessageAdmin || ""
        const displayedTime = getDisplayTime(chat.lastMessageUserTimestamp || chat.timestamp)
        const badgeCount = chat.unreadCount ?? 0
        const nameClass = badgeCount > 0 ? "text-white font-bold" : "text-[#e9edef] font-medium"
        const lastMessageClass = badgeCount > 0 ? "text-[#e9edef] font-bold" : "text-[#8696a0]"

        // Se utiliza el avatar disponible
        const avatarUrl = chat.userAvatar || chat.photoURL || chat.avatar || DEFAULT_AVATAR

        return (
          <div
            key={chat.id}
            onClick={() => handleChatClick(chat.id)}
            className={cn(
              "w-full flex items-center p-3 hover:bg-[#202c33] transition-colors cursor-pointer",
              selectedChatId === chat.id && "bg-[#202c33]",
            )}
          >
            <Avatar className="h-12 w-12 mr-3">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex justify-between items-baseline">
                <h3 className={cn("truncate text-base", nameClass)}>{displayName}</h3>
                <span className="text-xs text-[#8696a0]">{displayedTime}</span>
              </div>
              <div className="flex items-center gap-1">
                {chat.online && <div className="w-2 h-2 rounded-full bg-[#00a884]" />}
                <p className={cn("text-sm truncate", lastMessageClass)}>{lastMsgContent}</p>
                {badgeCount > 0 && (
                  <span className="ml-auto bg-[#00a884] text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
                    {badgeCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

