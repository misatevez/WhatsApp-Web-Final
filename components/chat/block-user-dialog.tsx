"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { ref, set } from "firebase/database"
import { database } from "@/lib/firebase"
import { UserX } from "lucide-react"

interface BlockUserDialogProps {
  userId: string
  userName: string
}

export function BlockUserDialog({ userId, userName }: BlockUserDialogProps) {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  const handleBlockUser = async () => {
    if (!user) return

    try {
      await set(ref(database, `users/${user.uid}/blockedUsers/${userId}`), true)
      setOpen(false)
    } catch (error) {
      console.error("Error blocking user:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <UserX className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Block User</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Are you sure you want to block {userName}?</p>
          <p className="text-sm text-muted-foreground mt-2">
            Blocked users will not be able to send you messages or call you.
          </p>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleBlockUser}>
            Block User
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

