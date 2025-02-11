"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { mockStatuses } from "@/lib/mockData"

export function StatusViewer() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % mockStatuses.length)
  }

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + mockStatuses.length) % mockStatuses.length)
  }

  const currentStatus = mockStatuses[currentIndex]

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="w-full bg-[#00a884] hover:bg-[#02906f] text-white">
        View Statuses
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#111b21] border-none text-[#e9edef] max-w-md p-0">
          <DialogHeader className="bg-[#202c33] px-4 py-3">
            <DialogTitle>Status Updates</DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Avatar className="h-16 w-16">
                <AvatarImage src={currentStatus.avatar} />
                <AvatarFallback>{currentStatus.userName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 ml-4">
                <h3 className="text-lg font-semibold">{currentStatus.userName}</h3>
                <p className="text-sm text-[#8696a0]">{currentStatus.timestamp}</p>
              </div>
            </div>
            <p className="text-lg bg-[#202c33] p-4 rounded-lg">{currentStatus.text}</p>
            <div className="flex justify-between mt-4">
              <Button onClick={handlePrevious} variant="ghost" className="text-[#00a884]">
                <ChevronLeft className="h-6 w-6" />
                Previous
              </Button>
              <Button onClick={handleNext} variant="ghost" className="text-[#00a884]">
                Next
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

