"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, X, Send } from "lucide-react"
import Image from "next/image"
import type { AdminStatus } from "@/types/interfaces"

interface StatusDialogProps {
  isOpen: boolean
  onClose: () => void
  statuses: AdminStatus[]
  onStatusResponse: (response: string, imageUrl: string) => void
}

export function StatusDialog({ isOpen, onClose, statuses, onStatusResponse }: StatusDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % statuses.length)
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + statuses.length) % statuses.length)
  }

  const handleSendResponse = async () => {
    if (!response.trim() || !statuses[currentIndex]) return

    setIsLoading(true)
    try {
      await onStatusResponse(response.trim(), statuses[currentIndex].imageUrl)
      setResponse("")
      onClose()
    } catch (error) {
      console.error("Error sending status response:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!statuses.length) return null

  const currentStatus = statuses[currentIndex]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#111b21] border-none text-[#e9edef] max-w-md p-0">
        <DialogHeader className="bg-[#202c33] px-4 py-3 flex-row items-center justify-between">
          <DialogTitle className="text-[#e9edef] text-base">Estado</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-[#aebac1] hover:text-[#e9edef] h-8 w-8">
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div className="relative">
          {/* Status Image Container */}
          <div className="relative aspect-[4/5] w-full bg-black">
            <Image src={currentStatus.imageUrl} alt={currentStatus.caption} fill className="object-contain" />
          </div>

          {/* Caption */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white text-sm">{currentStatus.caption}</p>
          </div>

          {/* Navigation Controls */}
          {statuses.length > 1 && (
            <>
              {/* Previous Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/20 h-8 w-8"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              {/* Next Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                disabled={currentIndex === statuses.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-black/20 h-8 w-8"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {/* Response Input */}
        <div className="p-3 bg-[#202c33] flex items-center gap-2">
          <Input
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Responder al estado..."
            className="flex-1 bg-[#2a3942] border-none text-[#d1d7db] placeholder:text-[#8696a0] focus-visible:ring-1 focus-visible:ring-[#00a884] h-9"
            onKeyPress={(e) => e.key === "Enter" && handleSendResponse()}
            disabled={isLoading}
          />
          <Button
            onClick={handleSendResponse}
            disabled={!response.trim() || isLoading}
            className="bg-[#00a884] hover:bg-[#017561] text-white h-9 w-9 p-0"
            size="icon"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Status Progress Indicators */}
        <div className="absolute top-[52px] left-0 right-0 px-2 flex gap-1">
          {statuses.map((_, index) => (
            <div key={index} className="flex-1 h-0.5 bg-white/30 overflow-hidden">
              <div
                className={`h-full bg-white transition-all duration-300 ${
                  index === currentIndex ? "w-full" : index < currentIndex ? "w-full" : "w-0"
                }`}
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

