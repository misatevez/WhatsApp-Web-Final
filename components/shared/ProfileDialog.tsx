import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProfileDialogProps {
  isOpen: boolean
  onClose: () => void
  name: string
  avatar: string
  online: boolean
  phoneNumber: string
  about?: string
}

export function ProfileDialog({ isOpen, onClose, name, avatar, online, phoneNumber, about }: ProfileDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#111b21] border-none text-[#e9edef] max-w-md p-0">
        <DialogHeader className="bg-[#202c33] px-4 py-3 flex-row items-center justify-between">
          <DialogTitle>Contact Profile</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-[#aebac1] hover:text-[#e9edef]">
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>
        <div className="p-4 space-y-4">
          <div className="flex justify-center">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatar} />
              <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold">{name}</h3>
            <p className="text-[#8696a0]">{phoneNumber}</p>
            <p className="text-[#8696a0]">{online ? "Online" : "Offline"}</p>
          </div>
          {about && (
            <div className="bg-[#202c33] rounded-lg p-3">
              <h4 className="text-[#8696a0] text-sm uppercase mb-1">About</h4>
              <p>{about}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

