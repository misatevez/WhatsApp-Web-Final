"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { ref, push, set } from "firebase/database"
import { database } from "@/lib/firebase"
import { Users } from "lucide-react"

export function CreateGroupDialog() {
  const [open, setOpen] = useState(false)
  const [groupName, setGroupName] = useState("")
  const [participants, setParticipants] = useState("")
  const { user } = useAuth()

  const handleCreateGroup = async () => {
    if (!user || !groupName.trim() || !participants.trim()) return

    try {
      const groupRef = push(ref(database, "groups"))
      const groupId = groupRef.key

      const participantList = participants.split(",").map((p) => p.trim())
      participantList.push(user.uid)

      await set(groupRef, {
        name: groupName,
        createdBy: user.uid,
        participants: participantList,
        createdAt: Date.now(),
      })

      // Add group to each participant's group list
      for (const participantId of participantList) {
        await set(ref(database, `users/${participantId}/groups/${groupId}`), true)
      }

      setOpen(false)
      setGroupName("")
      setParticipants("")
    } catch (error) {
      console.error("Error creating group:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Users className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input placeholder="Group Name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
          <Input
            placeholder="Participants (comma-separated UIDs)"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
          />
          <Button onClick={handleCreateGroup}>Create Group</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

