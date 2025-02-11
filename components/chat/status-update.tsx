"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { ref, push, set } from "firebase/database"
import { database } from "@/lib/firebase"

export function StatusUpdate() {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState("")
  const { user } = useAuth()

  const handleUpdateStatus = async () => {
    if (!user || !status.trim()) return

    try {
      const statusRef = push(ref(database, `users/${user.uid}/status`))
      await set(statusRef, {
        text: status,
        timestamp: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
      })

      setOpen(false)
      setStatus("")
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Update Status</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Your Status</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input placeholder="What's on your mind?" value={status} onChange={(e) => setStatus(e.target.value)} />
          <Button onClick={handleUpdateStatus}>Update</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

