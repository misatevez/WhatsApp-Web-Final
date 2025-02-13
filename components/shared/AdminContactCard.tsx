"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { X, Camera } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import type { AdminStatus } from "@/types/interfaces"

interface AdminContactCardProps {
  isOpen: boolean
  onClose: () => void
  adminProfile: {
    name: string
    avatar: string
    about?: string
  }
  statuses?: AdminStatus[]
  onViewStatus?: () => void
}

export function AdminContactCard({
  isOpen,
  onClose,
  adminProfile,
  statuses = [],
  onViewStatus,
}: AdminContactCardProps) {
  const hasStatuses = statuses.length > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#222e35] border-none text-[#e9edef] max-w-md p-0">
        <DialogHeader className="bg-[#202c33] px-4 py-3 flex-row items-center justify-between">
          <DialogTitle className="text-[#e9edef]">Información del Administrador</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-[#aebac1] hover:text-[#e9edef]">
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div className="p-4 space-y-6">
          <div className="bg-[#111b21] p-6 -mx-4 -mt-4 flex flex-col items-center gap-3">
            <div className="relative">
              {hasStatuses && (
                <div className="absolute -inset-2 rounded-full bg-[#00a884] cursor-pointer" onClick={onViewStatus}>
                  <div className="absolute inset-[3px] rounded-full bg-[#111b21]" />
                </div>
              )}
              <Avatar
                className={cn("h-32 w-32 border-4 border-[#00a884]", hasStatuses && "cursor-pointer")}
                onClick={hasStatuses ? onViewStatus : undefined}
              >
                <AvatarImage src={adminProfile.avatar} className="object-cover" />
                <AvatarFallback className="bg-[#202c33] text-2xl">
                  {adminProfile.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Status Preview */}
              {hasStatuses && (
                <div
                  className="absolute -right-16 top-0 w-16 h-16 rounded-lg overflow-hidden cursor-pointer shadow-lg transform scale-75 hover:scale-90 transition-transform"
                  onClick={onViewStatus}
                >
                  <Image
                    src={statuses[0].imageUrl}
                    alt="Status preview"
                    layout="fill"
                    objectFit="cover"
                    className="hover:opacity-90 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-1 right-1">
                    <Camera className="h-4 w-4 text-white" />
                  </div>
                </div>
              )}
            </div>
            <h2 className="text-xl font-normal text-[#e9edef]">{adminProfile.name}</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-[#111b21] rounded-lg p-4">
              <h4 className="text-[#8696a0] text-sm uppercase font-medium mb-2">Info</h4>
              <p className="text-[#e9edef]">{adminProfile.about || "Hey there! I am using WhatsApp"}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

