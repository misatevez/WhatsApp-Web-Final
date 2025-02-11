"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MoreVertical } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { StatusUpdate } from "./status-update"

export function UserProfileHeader() {
  const { user } = useAuth()

  return (
    <div className="h-16 bg-sidebar flex items-center justify-between px-4 border-b border-sidebar-border">
      <div className="flex items-center">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={user?.photoURL || "/placeholder.svg"} alt={user?.displayName || "User"} />
          <AvatarFallback>{user?.displayName?.slice(0, 2).toUpperCase() || "UN"}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="text-sm font-medium text-primary">{user?.displayName || "User"}</h2>
          <StatusUpdate />
        </div>
      </div>
      <Button variant="ghost" size="icon">
        <MoreVertical className="h-5 w-5" />
      </Button>
    </div>
  )
}

