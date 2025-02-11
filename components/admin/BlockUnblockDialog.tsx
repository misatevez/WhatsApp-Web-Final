"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/contexts/ToastContext"
import { blockContact, unblockContact } from "@/lib/firestore"

interface BlockUnblockDialogProps {
  isOpen: boolean
  onClose: () => void
  contact: {
    id: string
    name: string
    isBlocked: boolean
  }
  onBlockStatusChange: (contactId: string, isBlocked: boolean) => void
}

export function BlockUnblockDialog({ isOpen, onClose, contact, onBlockStatusChange }: BlockUnblockDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { addToast } = useToast()

  const handleBlockUnblock = async () => {
    setIsLoading(true)
    try {
      if (contact.isBlocked) {
        await unblockContact(contact.id)
        onBlockStatusChange(contact.id, false)
        addToast({
          title: "Contacto desbloqueado",
          description: `${contact.name} ha sido desbloqueado correctamente.`,
        })
      } else {
        await blockContact(contact.id)
        onBlockStatusChange(contact.id, true)
        addToast({
          title: "Contacto bloqueado",
          description: `${contact.name} ha sido bloqueado correctamente.`,
        })
      }
      onClose()
    } catch (error) {
      console.error("Error al bloquear/desbloquear contacto:", error)
      addToast({
        title: "Error",
        description: "Ocurrió un error al bloquear/desbloquear el contacto.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#111b21] border-none text-[#e9edef] max-w-md p-0">
        <DialogHeader className="bg-[#202c33] px-4 py-3">
          <DialogTitle>{contact.isBlocked ? "Desbloquear Contacto" : "Bloquear Contacto"}</DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4">
          <p>
            {contact.isBlocked
              ? `¿Estás seguro que deseas desbloquear a ${contact.name}?`
              : `¿Estás seguro que deseas bloquear a ${contact.name}?`}
          </p>
          <p className="text-sm text-[#8696a0]">
            {contact.isBlocked
              ? "Podrá enviarte mensajes nuevamente."
              : "No podrá enviarte más mensajes."}
          </p>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleBlockUnblock} disabled={isLoading}>
              {contact.isBlocked ? "Desbloquear" : "Bloquear"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

