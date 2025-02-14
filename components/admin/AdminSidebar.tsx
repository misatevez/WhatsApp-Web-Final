"use client"

import { DEFAULT_AVATAR } from "@/constants/constants"
import { useState } from "react"
import { MessageSquare, Users, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AddContactDialog } from "@/components/admin/add-contact-dialog"
import { StatusUpdateDialog } from "@/components/admin/status-update-dialog"
import { AdminProfileDialog } from "@/components/admin/admin-profile-dialog"
import type { Chat, Category, AdminProfile } from "@/types/interfaces"
import { useAppContext } from "@/contexts/AppContext"
import { setActiveTab, setSelectedCategories } from "@/contexts/appActions"
import { SearchBar } from "./SearchBar"
import { CategoryFilters } from "./CategoryFilters"
import { ChatList } from "@/components/shared/ChatList"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { useToast } from "@/contexts/ToastContext"

interface AdminSidebarProps {
  adminProfile: AdminProfile
  categories: Category[]
  chats: Chat[]
  activeTab: string
  selectedCategories: string[]
  selectedChatId: string | null
  onUpdateAdminProfile: (name: string, avatar: string, about: string) => void
  onAddContact: (phoneNumber: string, name: string) => void
  onOpenCategoryManagement: () => void
  onLogout: () => void
}

export function AdminSidebar({
  adminProfile,
  categories,
  chats,
  activeTab,
  selectedCategories,
  selectedChatId,
  onUpdateAdminProfile,
  onAddContact,
  onOpenCategoryManagement,
}: AdminSidebarProps) {
  const { dispatch } = useAppContext()
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddContactDialogOpen, setIsAddContactDialogOpen] = useState(false)
  const router = useRouter()
  const { addToast } = useToast()

  const handleLogout = async () => {
    try {
      await auth.signOut()
      addToast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
      })
      router.push("/admin") // Redirect back to admin login
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
      addToast({
        title: "Error",
        description: "No se pudo cerrar la sesión",
        variant: "destructive",
      })
    }
  }

  const filteredChats = chats.filter((chat) => {
    const matchesSearch = searchQuery
      ? (chat.name && chat.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (chat.phoneNumber && chat.phoneNumber.includes(searchQuery)) ||
        (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
      : true

    const matchesTab = activeTab === "contacts" ? Boolean(chat.isAgendado) : true

    const matchesCategories =
      selectedCategories.length === 0 ||
      (chat.categories && chat.categories.some((catId) => selectedCategories.includes(catId)))

    return matchesSearch && matchesTab && matchesCategories
  })

  return (
    <div className="w-[400px] flex flex-col border-r border-[#202c33]">
      <div className="h-[60px] bg-[#202c33] flex items-center justify-between px-4 relative z-10">
        <AdminProfileDialog
          profile={adminProfile || { name: "", avatar: DEFAULT_AVATAR, about: "" }}
          onUpdate={onUpdateAdminProfile}
        >
          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarImage src={adminProfile?.avatar || DEFAULT_AVATAR} />
            <AvatarFallback>{adminProfile?.name ? adminProfile.name.slice(0, 2).toUpperCase() : "AD"}</AvatarFallback>
          </Avatar>
        </AdminProfileDialog>
        <div className="flex items-center gap-3">
          <StatusUpdateDialog />
          <AddContactDialog
            onAddContact={onAddContact}
            chats={chats}
            isOpen={isAddContactDialogOpen}
            setIsOpen={setIsAddContactDialogOpen}
          />
          <Button variant="ghost" size="icon" className="text-[#aebac1]" onClick={onOpenCategoryManagement}>
            <MessageSquare className="h-5 w-5 mx-auto" />
          </Button>
          <Button variant="ghost" size="icon" className="text-[#aebac1] hover:text-red-500" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex border-b border-[#202c33] relative z-10 bg-[#111b21]">
        <button
          className={cn(
            "flex-1 py-4 text-sm font-medium relative",
            activeTab === "chats" ? "text-[#00a884]" : "text-[#8696a0]",
          )}
          onClick={() => dispatch(setActiveTab("chats"))}
        >
          <MessageSquare className="h-5 w-5 mx-auto" />
          <span className="mt-1 block">Chats</span>
          {activeTab === "chats" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00a884]" />}
        </button>
        <button
          className={cn(
            "flex-1 py-4 text-sm font-medium relative",
            activeTab === "contacts" ? "text-[#00a884]" : "text-[#8696a0]",
          )}
          onClick={() => dispatch(setActiveTab("contacts"))}
        >
          <Users className="h-5 w-5 mx-auto" />
          <span className="mt-1 block">Contactos</span>
          {activeTab === "contacts" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00a884]" />}
        </button>
      </div>

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <CategoryFilters
        categories={categories}
        selectedCategories={selectedCategories}
        onCategoryClick={(categoryId) => {
          if (selectedCategories.includes(categoryId)) {
            dispatch(setSelectedCategories(selectedCategories.filter((id) => id !== categoryId)))
          } else {
            dispatch(setSelectedCategories([...selectedCategories, categoryId]))
          }
        }}
      />
      <ChatList chats={filteredChats} selectedChatId={selectedChatId} />
    </div>
  )
}

