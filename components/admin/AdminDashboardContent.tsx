"use client"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/contexts/ToastContext"
import { useAppContext } from "@/contexts/AppContext"
import { AdminSidebar } from "./AdminSidebar"
import { AdminChatView } from "./AdminChatView"
import { CategoryManagementDialog } from "./category-management-dialog"
import { ContactInfoDialog } from "./contact-info-dialog"
import { updateChat, updateAdminProfile } from "@/contexts/appActions"
import { onSnapshot, collection, query, orderBy } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { sendMessage, editContact } from "@/lib/firestore"
import { InstallPWA } from "@/components/shared/InstallPWA"
import type { Message } from "@/types/interfaces"

export function AdminDashboardContent() {
  const { addToast } = useToast()
  const router = useRouter()
  const { state, dispatch } = useAppContext()
  const { chats, adminProfile, categories, selectedChatId, unknownContacts, activeTab, selectedCategories } = state

  const [chatMessages, setChatMessages] = useState<Message[]>([])
  const [selectedContact, setSelectedContact] = useState<{
    phoneNumber: string
    name?: string
    about?: string
    online?: boolean
  } | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(false)

  const unsubscribeRef = useRef<() => void>()
  const selectedChatData = chats.find((c) => c.id === selectedChatId)

  const handleLogout = async () => {
    try {
      await auth.signOut()
      addToast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      })
      router.push("/")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      addToast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (!selectedChatId) {
      setChatMessages([])
      if (unsubscribeRef.current) unsubscribeRef.current()
      return
    }
    if (unsubscribeRef.current) unsubscribeRef.current()

    const messagesRef = collection(db, `chats/${selectedChatId}/messages`)
    const q = query(messagesRef, orderBy("timestamp"))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updated = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Message)
      setChatMessages(updated)
    })

    unsubscribeRef.current = unsubscribe
    return () => unsubscribe()
  }, [selectedChatId])

  const handleEditContact = async (chatId: string, newName: string, categories: string[]) => {
    try {
      await editContact(chatId, newName, categories)

      dispatch(
        updateChat({
          id: chatId,
          name: newName,
          categories: categories,
          isAgendado: true,
        }),
      )

      addToast({
        title: "Éxito",
        description: "Contacto actualizado correctamente",
      })
    } catch (error) {
      console.error("Error updating contact:", error)
      addToast({
        title: "Error",
        description: "Error al actualizar el contacto",
        variant: "destructive",
      })
    }
  }

  const handleSendMessage = async (content: string, type: "text" | "image" | "document") => {
    if (!selectedChatId) return

    const newMessage: Omit<Message, "id"> = {
      content,
      timestamp: new Date().toISOString(),
      isOutgoing: true,
      type,
      status: "sending",
    }

    try {
      const messageId = await sendMessage(selectedChatId, newMessage)
      console.log("[handleSendMessage] Message sent with ID:", messageId)

      dispatch(
        updateChat({
          id: selectedChatId,
          lastMessageAdmin: type === "text" ? content : type.charAt(0).toUpperCase() + type.slice(1),
          lastMessageAdminTimestamp: new Date().toISOString(),
          lastReadByAdmin: new Date().toISOString(),
        }),
      )
    } catch (error) {
      console.error("Error sending message:", error)
      addToast({
        title: "Error",
        description: "Error al enviar el mensaje",
        variant: "destructive",
      })
    }
  }

  const handleBlockStatusChange = async (contactId: string, isBlocked: boolean) => {
    try {
      dispatch(
        updateChat({
          id: contactId,
          isBlocked,
          blockedAt: isBlocked ? new Date().toISOString() : null,
        }),
      )

      addToast({
        title: "Éxito",
        description: isBlocked ? "Contacto bloqueado" : "Contacto desbloqueado",
      })
    } catch (error) {
      console.error("Error updating block status:", error)
      addToast({
        title: "Error",
        description: "Error al actualizar el estado de bloqueo",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex h-screen bg-[#111b21]">
      <InstallPWA />
      <AdminSidebar
        adminProfile={adminProfile}
        categories={categories}
        chats={chats}
        activeTab={activeTab}
        selectedCategories={selectedCategories}
        selectedChatId={selectedChatId}
        onUpdateAdminProfile={(name, avatar, about) => dispatch(updateAdminProfile({ name, avatar, about }))}
        onAddContact={() => {
          /* Implementar lógica de agregar contacto */
        }}
        onOpenCategoryManagement={() => setIsCategoryManagementOpen(true)}
        onLogout={handleLogout}
      />

      {selectedChatData ? (
        <AdminChatView
          selectedChat={selectedChatData}
          categories={categories}
          chatMessages={chatMessages}
          lastMessageUserTimestamp={selectedChatData.lastMessageUserTimestamp}
          lastReadByAdmin={selectedChatData.lastReadByAdmin}
          onEditContact={handleEditContact}
          onSendMessage={handleSendMessage}
          onOpenProfile={() => setIsProfileOpen(true)}
          onBlockStatusChange={handleBlockStatusChange}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#222e35]">
          <h1 className="text-[#e9edef] text-3xl font-light mb-4">WhatsApp Web</h1>
          <p className="text-[#8696a0] mb-2">Envía y recibe mensajes sin mantener tu teléfono conectado.</p>
          <p className="text-[#8696a0]">
            Usa WhatsApp en hasta 4 dispositivos vinculados y 1 teléfono al mismo tiempo.
          </p>
        </div>
      )}

      <CategoryManagementDialog
        categories={categories}
        onAddCategory={() => {
          /* Implementar lógica de agregar categoría */
        }}
        onEditCategory={() => {
          /* Implementar lógica de editar categoría */
        }}
        onDeleteCategory={() => {
          /* Implementar lógica de eliminar categoría */
        }}
        isOpen={isCategoryManagementOpen}
        onClose={() => setIsCategoryManagementOpen(false)}
      />

      {selectedContact && (
        <ContactInfoDialog
          isOpen={!!selectedContact}
          onClose={() => setSelectedContact(null)}
          contact={selectedContact}
          onAddContact={() => {
            /* Implementar lógica de agregar contacto */
          }}
        />
      )}
    </div>
  )
}

