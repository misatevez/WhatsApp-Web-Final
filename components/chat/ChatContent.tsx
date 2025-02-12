"use client"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useToast } from "@/contexts/ToastContext"
import { ChatHeader } from "@/components/shared/chat-header"
import { MessageList } from "@/components/shared/message-list"
import { MessageInput } from "@/components/shared/message-input"
import { BlockedUserMessage } from "@/components/shared/BlockedUserMessage"
import { sendMessage } from "@/lib/firestore/messages"
import { fetchAdminProfile } from "@/lib/firestore/adminProfile"
import { fetchUserProfile, updateUserProfile } from "@/lib/firestore/users"
import { DEFAULT_AVATAR } from "@/constants/constants"
import { doc, onSnapshot, collection, query, orderBy, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Chat, Message, AdminProfile, UserProfile, AdminStatus } from "@/types/interfaces"

export default function ChatContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const rawPhoneNumber = searchParams.get("phone")
  const { toast } = useToast()

  const [chat, setChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [adminStatuses, setAdminStatuses] = useState<AdminStatus[]>([])
  const [isBlocked, setIsBlocked] = useState(false)

  // Format the phone number to include the '+' if it's missing
  const phoneNumber = rawPhoneNumber ? (rawPhoneNumber.startsWith("+") ? rawPhoneNumber : `+${rawPhoneNumber}`) : null

  const sendWelcomeMessage = useCallback(async (chatId: string) => {
    try {
      const welcomeMessage = `¡Bienvenido a la web de cargas de línea 0800! 👨🏻‍💻👩🏼‍💻🎰✨

Solicita tu usuario en la plataforma que más te guste 📲 y consulta el CVU para comenzar a jugar de forma segura. 🍀💜

¡Buena suerte y que la fortuna te acompañe en cada jugada! 🎲💰

⚠️ Recuerda instalar el acceso rápido para poder cargar en todo momento y a toda velocidad!`;
      await sendMessage(
        chatId,
        welcomeMessage,
        true, // isOutgoing true for admin messages
        "text",
      )
    } catch (error) {
      console.error("Error sending welcome message:", error)
    }
  }, [])

  useEffect(() => {
    if (!phoneNumber) {
      toast({
        title: "Error",
        description: "Número de teléfono no proporcionado",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    const loadChat = async () => {
      try {
        const chatRef = doc(db, "chats", phoneNumber)
        const chatDoc = await getDoc(chatRef)

        if (!chatDoc.exists()) {
          // Create new chat document if it doesn't exist
          const newChat = {
            id: phoneNumber,
            phoneNumber: phoneNumber,
            name: "",
            lastMessage: "",
            timestamp: serverTimestamp(),
            unreadCount: 0,
            isAgendado: false,
            createdAt: serverTimestamp(),
          }

          await setDoc(chatRef, newChat)
          setChat(newChat as Chat)

          // Send welcome message for new chats
          await sendWelcomeMessage(phoneNumber)
        } else {
          setChat({ id: chatDoc.id, ...chatDoc.data() } as Chat)
        }

        // Subscribe to chat document for updates
        const unsubscribe = onSnapshot(chatRef, (doc) => {
          if (doc.exists()) {
            const chatData = doc.data() as Chat
            setChat(chatData)
            setIsBlocked(chatData.isBlocked || false)
          }
        })

        return () => unsubscribe()
      } catch (error) {
        console.error("Error loading chat:", error)
        toast({
          title: "Error",
          description: "Error al cargar el chat",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadChat()
  }, [phoneNumber, toast, router, sendWelcomeMessage])

  // Subscribe to admin statuses
  useEffect(() => {
    const statusesRef = collection(db, "adminStatuses")
    const q = query(statusesRef, orderBy("timestamp", "desc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const statuses = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AdminStatus[]

      // Filter statuses from the last 24 hours
      const now = new Date()
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      const activeStatuses = statuses.filter((status) => {
        const statusDate = new Date(status.timestamp)
        return statusDate > twentyFourHoursAgo
      })

      setAdminStatuses(activeStatuses)
    })

    return () => unsubscribe()
  }, [])

  // Load admin profile
  useEffect(() => {
    const loadAdminProfile = async () => {
      try {
        const profile = await fetchAdminProfile()
        if (profile) {
          setAdminProfile(profile)
        } else {
          setAdminProfile({
            name: "LINEA 0800 24 HS 💻💜🩷✨",
            avatar: DEFAULT_AVATAR,
            about: "Cuenta oficial",
            online: true,
          })
        }
      } catch (error) {
        console.error("Error loading admin profile:", error)
      }
    }
    loadAdminProfile()
  }, [])

  // Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!phoneNumber) return

      try {
        const profile = await fetchUserProfile(phoneNumber)
        if (profile) {
          setUserProfile(profile)
        } else {
          // Create initial profile
          const initialProfile = {
            name: phoneNumber,
            avatar: DEFAULT_AVATAR,
            phoneNumber,
            about: "¡Hola! Estoy usando WhatsApp",
            createdAt: new Date().toISOString(),
          }
          await updateUserProfile(phoneNumber, initialProfile)
          setUserProfile(initialProfile)
        }
      } catch (error) {
        console.error("Error loading user profile:", error)
      }
    }
    loadUserProfile()
  }, [phoneNumber])

  // Subscribe to messages
  useEffect(() => {
    if (!phoneNumber) return

    const messagesRef = collection(db, `chats/${phoneNumber}/messages`)
    const q = query(messagesRef, orderBy("timestamp", "asc"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[]
      setMessages(updatedMessages)
    })

    return () => unsubscribe()
  }, [phoneNumber])

  const handleSendMessage = async (content: string, type: "text" | "image" | "document") => {
    if (!chat?.id || !content.trim()) return

    try {
      await sendMessage(
        chat.id,
        content.trim(),
        false, // isOutgoing false for user messages
        type,
      )
    } catch (error) {
      console.error("Error sending message:", error)
    }
  }

  const handleUpdateProfile = async (name: string, avatar: string, about: string) => {
    if (!phoneNumber) return

    try {
      await updateUserProfile(phoneNumber, {
        name,
        avatar,
        about,
        updatedAt: new Date().toISOString(),
      })

      setUserProfile((prev) => ({
        ...prev!,
        name,
        avatar,
        about,
      }))
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!chat || !adminProfile) {
    return null
  }

  if (isBlocked) {
    return <BlockedUserMessage />
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        name={adminProfile.name}
        avatar={adminProfile.avatar}
        online={adminProfile.online ? "en línea" : ""}
        userProfile={userProfile}
        isUserChat={true}
        adminProfile={adminProfile}
        statuses={adminStatuses}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        onUpdateProfile={handleUpdateProfile}
        handleSendMessage={handleSendMessage}
      />

      <div className="flex-1 overflow-y-auto relative">
        <MessageList
          messages={messages}
          currentUserId="user"
          chatId={chat.id}
          invertOutgoing={true}
          chatSearchQuery={searchQuery}
        />
      </div>

      <MessageInput onSendMessage={handleSendMessage} chatId={chat.id} />
    </div>
  )
}

