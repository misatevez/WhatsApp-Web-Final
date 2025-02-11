"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserPlus, Edit2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { BaseDialog } from "@/components/shared/base-dialog"
import type { ContactInfoDialogProps } from "@/types/interfaces"

const DEFAULT_AVATAR =
  "https://firebasestorage.googleapis.com/v0/b/cargatusfichas.firebasestorage.app/o/admin%2Favatar.png?alt=media&token=54132d01-d241-429a-b131-1be8951406b7"

export function ContactInfoDialog({ isOpen, onClose, contact, onAddContact }: ContactInfoDialogProps) {
  const [newName, setNewName] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const handleAddContact = () => {
    if (newName.trim()) {
      onAddContact(contact.phoneNumber, newName)
      onClose()
    }
  }

  return (
    <BaseDialog isOpen={isOpen} onClose={onClose} title="Contact info">
      <div className="bg-[#202c33] p-6 flex flex-col items-center gap-3 -mx-4 -mt-4">
        <Avatar className="h-32 w-32">
          <AvatarImage src={DEFAULT_AVATAR} />
          <AvatarFallback className="text-4xl">#</AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Contact name"
              className="bg-[#2a3942] border-0 text-[#d1d7db] placeholder:text-[#8696a0] focus-visible:ring-0"
              autoFocus
            />
          ) : (
            <h2 className="text-xl font-normal">{contact.phoneNumber}</h2>
          )}
          <Button variant="ghost" size="icon" className="text-[#00a884]" onClick={() => setIsEditing(!isEditing)}>
            <Edit2 className="h-4 w-4" />
          </Button>
        </div>
        {contact.online && <div className="text-[#00a884] text-sm">online</div>}
      </div>
      <div className="bg-[#202c33] rounded-lg p-3 mb-4">
        <h3 className="text-[#8696a0] text-sm uppercase mb-1">About</h3>
        <p>{contact.about || "Hey there! I am using WhatsApp"}</p>
      </div>
      {!contact.name && (
        <Button
          variant="ghost"
          className="w-full justify-start text-[#00a884] hover:bg-[#202c33]"
          onClick={handleAddContact}
        >
          <UserPlus className="h-5 w-5 mr-3" />
          Add to Contacts
        </Button>
      )}
    </BaseDialog>
  )
}

