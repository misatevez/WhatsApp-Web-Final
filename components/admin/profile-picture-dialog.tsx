import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import Image from "next/image"
import type { ProfilePictureDialogProps } from "@/types/interfaces"

export function ProfilePictureDialog({ isOpen, onClose, imageUrl, name }: ProfilePictureDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#111b21] border-none text-[#e9edef] max-w-2xl p-0">
        <DialogHeader className="bg-[#202c33] px-4 py-3 flex-row items-center justify-between">
          <DialogTitle>{name}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-[#aebac1] hover:text-[#e9edef]">
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        <div className="relative aspect-square w-full">
          <Image src={imageUrl || "/placeholder.svg"} alt={`${name}'s profile picture`} fill className="object-cover" />
        </div>
      </DialogContent>
    </Dialog>
  )
}

