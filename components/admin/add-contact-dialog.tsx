"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { agendarContacto } from "@/lib/contactUtils"
import type { AddContactDialogProps, Chat } from "@/types/interfaces"

export function AddContactDialog({ onAddContact, chats = [], isOpen, setIsOpen }: AddContactDialogProps) {
  const [newContactName, setNewContactName] = useState("")
  const [newContactPhone, setNewContactPhone] = useState("")
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)

  const handleAdd = async () => {
    if (newContactPhone.trim() && newContactName.trim()) {
      if (selectedChat) {
        // Actualizar contacto existente
        await agendarContacto(selectedChat.id, newContactName.trim())
        onAddContact(selectedChat.id, newContactName.trim())
      } else {
        // Crear nuevo contacto
        // Aquí deberías implementar la lógica para crear un nuevo chat en Firestore
        // y luego llamar a onAddContact con el ID del nuevo chat
      }
      setNewContactName("")
      setNewContactPhone("")
      setSelectedChat(null)
      setIsOpen(false)
    }
  }

  const handleSelectChat = (chat: Chat) => {
    setNewContactPhone(chat.phoneNumber)
    setSelectedChat(chat)
  }

  const unknownChats = chats.filter((chat) => !chat.isAgendado)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-[#323739] text-[#e9edef]">
        <DialogHeader>
          <DialogTitle>Add New Contact</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Input
            value={newContactPhone}
            onChange={(e) => setNewContactPhone(e.target.value)}
            placeholder="Phone Number"
            className="bg-[#2a3942] border-0 text-[#d1d7db] placeholder:text-[#8696a0] focus-visible:ring-0"
          />
          <Input
            value={newContactName}
            onChange={(e) => setNewContactName(e.target.value)}
            placeholder="Contact Name"
            className="bg-[#2a3942] border-0 text-[#d1d7db] placeholder:text-[#8696a0] focus-visible:ring-0"
          />
          <Button onClick={handleAdd} className="w-full bg-[#00a884] hover:bg-[#02906f] text-white">
            Add Contact
          </Button>
          {unknownChats.length > 0 && (
            <div>
              <h3 className="text-[#e9edef] text-sm font-medium mb-2">Unknown Contacts</h3>
              {unknownChats.map((chat) => (
                <Button
                  key={chat.id}
                  variant="ghost"
                  className="w-full justify-start text-[#e9edef] hover:bg-[#2a3942]"
                  onClick={() => handleSelectChat(chat)}
                >
                  {chat.phoneNumber}
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

