"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreVertical, X, Phone, Tag, Save } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { editContact } from "@/lib/firestore"
import { useToast } from "@/contexts/ToastContext"
import { cn } from "@/lib/utils"

const DEFAULT_AVATAR =
  "https://firebasestorage.googleapis.com/v0/b/cargatusfichas.firebasestorage.apps/o/admin%2Favatar.png?alt=media&token=54132d01-d241-429a-b131-1be8951406b7"

interface EditContactDialogProps {
  contact: {
    id: string
    name: string
    phoneNumber: string
    photoURL?: string
    avatar?: string
    userAvatar?: string
    categories?: string[]
  }
  onEditContact: (id: string, newName: string, categories: string[]) => void
  categories?: { id: string; name: string; color: string }[]
  onClose?: () => void
}

export function EditContactDialog({ contact, onEditContact, categories = [], onClose }: EditContactDialogProps) {
  const [open, setOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { addToast } = useToast()

  // Reset state when dialog opens or contact changes
  useEffect(() => {
    if (open) {
      setNewName(contact.name)
      setSelectedCategories(contact.categories || [])
    }
  }, [open, contact])

  const handleEdit = async () => {
    if (!newName.trim()) {
      addToast({
        title: "Error",
        description: "El nombre del contacto no puede estar vacío",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      await editContact(contact.id, newName, selectedCategories)
      onEditContact(contact.id, newName, selectedCategories)

      addToast({
        title: "Éxito",
        description: "Contacto actualizado correctamente",
      })

      setOpen(false)
    } catch (error) {
      console.error("Error editing contact:", error)
      addToast({
        title: "Error",
        description: "Error al actualizar el contacto",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get the best available avatar
  const avatarUrl = contact.userAvatar || contact.photoURL || contact.avatar || DEFAULT_AVATAR

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="icon"
        className="text-[#aebac1] hover:text-[#e9edef] hover:bg-[#3a4952] transition-colors"
        onClick={() => setOpen(true)}
      >
        <MoreVertical className="h-5 w-5" />
      </Button>

      <DialogContent className="bg-[#111b21] border-none text-[#e9edef] max-w-md p-0">
        <DialogHeader className="bg-[#202c33] px-4 py-3 flex-row items-center justify-between">
          <DialogTitle className="text-lg font-medium">Editar Contacto</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="text-[#aebac1] hover:text-[#e9edef] hover:bg-[#3a4952]"
            onClick={() => {
              setOpen(false)
              if (onClose) onClose()
            }}
          >
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Avatar and Basic Info */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-32 w-32 border-4 border-[#00a884]">
              <AvatarImage src={avatarUrl} className="object-cover" />
              <AvatarFallback className="bg-[#202c33] text-2xl">
                {contact.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-[#8696a0] uppercase font-medium">Nombre</label>
              <div className="relative">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-[#2a3942] border-none text-[#d1d7db] placeholder:text-[#8696a0] focus-visible:ring-1 focus-visible:ring-[#00a884] pl-10"
                  placeholder="Nombre del contacto"
                />
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8696a0]" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-[#8696a0] uppercase font-medium">Teléfono</label>
              <div className="relative">
                <Input
                  value={contact.phoneNumber}
                  readOnly
                  className="bg-[#2a3942] border-none text-[#8696a0] focus-visible:ring-1 focus-visible:ring-[#00a884] pl-10"
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8696a0]" />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
              <label className="text-xs text-[#8696a0] uppercase font-medium">Categorías</label>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={cn(
                      "flex items-center gap-2 p-2.5 rounded-lg transition-colors",
                      "hover:bg-[#202c33] cursor-pointer",
                      selectedCategories.includes(category.id) && "bg-[#202c33]",
                    )}
                    onClick={() => {
                      setSelectedCategories((prev) =>
                        prev.includes(category.id) ? prev.filter((id) => id !== category.id) : [...prev, category.id],
                      )
                    }}
                  >
                    <Checkbox
                      id={category.id}
                      checked={selectedCategories.includes(category.id)}
                      className="data-[state=checked]:bg-[#00a884] data-[state=checked]:border-[#00a884]"
                    />
                    <label
                      htmlFor={category.id}
                      className="text-sm font-medium cursor-pointer select-none"
                      style={{ color: category.color }}
                    >
                      {category.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleEdit}
            disabled={isLoading || !newName.trim()}
            className="w-full bg-[#00a884] hover:bg-[#017561] text-white font-medium h-11 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

