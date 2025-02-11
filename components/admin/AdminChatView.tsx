"use client"

import { useState, useEffect } from "react"
import { Search, X, UserX } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EditContactDialog } from "@/components/admin/edit-contact-dialog"
import { BlockUnblockDialog } from "@/components/admin/BlockUnblockDialog"
import { MessageList } from "@/components/shared/message-list"
import { MessageInput } from "@/components/shared/message-input"
import { doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { ref, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"
import { sendMessage, resetUnreadCount } from "@/lib/firestore"
import { useToast } from "@/contexts/ToastContext"
import { DEFAULT_AVATAR } from "@/constants/constants"
import type { Chat, Message, Category } from "@/types/interfaces"

interface AdminChatViewProps {
  selectedChat: Chat
  categories: Category[]
  chatMessages: Message[]
  onEditContact: (id: string, newName: string, newCategories: string[]) => void
  onOpenProfile: () => void
  onBlockStatusChange: (contactId: string, isBlocked: boolean) => void
  lastMessageUserTimestamp?: string | null
  lastReadByAdmin?: any
}

export function AdminChatView({
  selectedChat,
  categories,
  chatMessages,
  onEditContact,
  onOpenProfile,
  onBlockStatusChange,
  lastMessageUserTimestamp,
  lastReadByAdmin,
}: AdminChatViewProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [chatSearchQuery, setChatSearchQuery] = useState("")
  const [isBlockUnblockDialogOpen, setIsBlockUnblockDialogOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string>(selectedChat.userAvatar || selectedChat.photoURL || selectedChat.avatar || DEFAULT_AVATAR)
  const { addToast } = useToast()

  // Load user avatar from storage
  useEffect(() => {
    const loadUserAvatar = async () => {
      if (selectedChat.phoneNumber) {
        try {
          // Try to get user avatar from storage
          const avatarRef = ref(storage, `users/${selectedChat.phoneNumber}/avatar`)
          const url = await getDownloadURL(avatarRef)
          setAvatarUrl(url)
        } catch (error) {
          // If no avatar in storage, use existing avatar or default
          setAvatarUrl(selectedChat.userAvatar || selectedChat.photoURL || selectedChat.avatar || DEFAULT_AVATAR)
        }
      }
    }

    loadUserAvatar()
  }, [selectedChat.phoneNumber, selectedChat.userAvatar, selectedChat.photoURL, selectedChat.avatar])

  useEffect(() => {
    if (selectedChat?.id) {
      resetUnreadCount(selectedChat.id).catch(console.error)
    }
  }, [selectedChat?.id])

  const handleSendMessage = async (content: string, type: "text" | "image" | "document") => {
    if (!content.trim() || !selectedChat?.id) {
      console.log("[handleSendMessage] Invalid parameters:", { content, chatId: selectedChat?.id })
      return
    }

    try {
      // Send message using the updated sendMessage function
      const messageId = await sendMessage(
        selectedChat.id,
        content.trim(),
        true, // isOutgoing true for admin messages
        type
      )

      console.log("[handleSendMessage] Message sent with ID:", messageId)

      // Update chat metadata
      const chatRef = doc(db, "chats", selectedChat.id)
      await updateDoc(chatRef, {
        lastMessage: content.trim(),
        lastMessageAdmin: content.trim(),
        lastMessageAdminTimestamp: serverTimestamp(),
        timestamp: serverTimestamp(),
        unreadCount: 0
      })

      addToast({
        title: "Mensaje enviado",
        description: "El mensaje se envió correctamente"
      })
    } catch (error) {
      console.error("Error sending message:", error)
      addToast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-[60px] bg-[#202c33] flex items-center justify-between px-4 relative z-10">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-3 cursor-pointer" onClick={onOpenProfile}>
            <AvatarImage src={avatarUrl} />
            <AvatarFallback>{selectedChat.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-[#e9edef] text-base font-medium cursor-pointer hover:underline" onClick={onOpenProfile}>
              {selectedChat.name || selectedChat.phoneNumber}
            </h2>
            {selectedChat.online && <p className="text-xs text-[#8696a0]">en línea</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isSearchOpen ? (
            <div className="flex items-center bg-[#2a3942] rounded-md">
              <Input
                value={chatSearchQuery}
                onChange={(e) => setChatSearchQuery(e.target.value)}
                placeholder="Buscar mensajes"
                className="bg-transparent border-none text-[#d1d7db] placeholder:text-[#8696a0] focus-visible:ring-0"
              />
              <Button
                variant="ghost"
                size="icon"
                className="text-[#aebac1]"
                onClick={() => {
                  setIsSearchOpen(false)
                  setChatSearchQuery("")
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <>
              <Button variant="ghost" size="icon" className="text-[#aebac1]" onClick={() => setIsSearchOpen(true)}>
                <Search className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#aebac1]"
                onClick={() => setIsBlockUnblockDialogOpen(true)}
              >
                <UserX className="h-5 w-5" />
              </Button>
            </>
          )}
          <EditContactDialog contact={selectedChat} onEditContact={onEditContact} categories={categories} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
        <MessageList
          messages={chatMessages}
          currentUserId="admin"
          chatSearchQuery={chatSearchQuery}
          chatId={selectedChat.id}
          lastReadMessageId={selectedChat.lastReadMessageId}
          invertOutgoing={false}
          lastMessageUserTimestamp={lastMessageUserTimestamp}
          lastReadByAdmin={lastReadByAdmin}
        />
      </div>

      <MessageInput onSendMessage={handleSendMessage} chatId={selectedChat.id} />

      <BlockUnblockDialog
        isOpen={isBlockUnblockDialogOpen}
        onClose={() => setIsBlockUnblockDialogOpen(false)}
        contact={{
          id: selectedChat.id,
          name: selectedChat.name,
          isBlocked: selectedChat.isBlocked || false,
        }}
        onBlockStatusChange={onBlockStatusChange}
      />
    </div>
  )
}

