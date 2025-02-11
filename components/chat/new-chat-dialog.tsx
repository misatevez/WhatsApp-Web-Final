"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ref, push, set } from "firebase/database"
import { database } from "@/lib/firebase"

export function NewChatDialog() {
  const [open, setOpen] = useState(false)
  const [contactEmail, setContactEmail] = useState("")
  const { user } = useAuth()

  const handleCreateChat = async () => {
    if (!user) return

    try {
      // Create a new chat
      const newChatRef = push(ref(database, "chats"))
      const chatId = newChatRef.key

      // Set chat info
      await set(ref(database, `chats/${chatId}/info`), {
        name: contactEmail,
        status: "Active",
      })

      // Add chat to user's chat list
      await set(ref(database, `users/${user.uid}/chats/${chatId}`), {
        name: contactEmail,
        lastMessage: "",
        timestamp: Date.now(),
      })

      setOpen(false)
      setContactEmail("")
    } catch (error) {
      console.error("Error creating chat:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Plus className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Chat</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Enter contact email"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
          <Button onClick={handleCreateChat}>Create Chat</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

