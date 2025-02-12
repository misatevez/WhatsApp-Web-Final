"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Share, Plus } from "lucide-react"

export function IOSInstallPrompt() {
  const [isOpen, setIsOpen] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if device is iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    
    // Check if already installed
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone
    
    setIsIOS(isIOSDevice)
    setIsStandalone(isInStandaloneMode)

    // Show prompt after a short delay
    if (isIOSDevice && !isInStandaloneMode) {
      const timer = setTimeout(() => setIsOpen(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!isIOS || isStandalone) return null

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-[#111b21] border-none text-[#e9edef] max-w-[280px] p-4">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp Logo"
              width={40}
              height={40}
            />
          </div>
          <DialogTitle className="text-center text-base">
            Instalar WhatsApp Web
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3">
            {/* Step 1 */}
            <div className="flex items-center gap-2 p-2 bg-[#2a3942] rounded-lg">
              <Share className="h-4 w-4 text-[#00a884] shrink-0" />
              <p className="text-xs">1. Toca el botón "Compartir"</p>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-2 p-2 bg-[#2a3942] rounded-lg">
              <Plus className="h-4 w-4 text-[#00a884] shrink-0" />
              <p className="text-xs">2. "Agregar a Pantalla de inicio"</p>
            </div>

            {/* Preview Image */}
            <div className="relative aspect-[9/16] h-[120px] mx-auto">
              <Image
                src="https://firebasestorage.googleapis.com/v0/b/cargatusfichas24hs.firebasestorage.app/o/admin%2Ffavicon%20final.png?alt=media&token=4bd18c29-affc-42fa-a281-17fb2cbb6143"
                alt="iOS Install Steps"
                fill
                className="object-contain rounded-lg"
              />
            </div>
          </div>

          <Button
            onClick={() => setIsOpen(false)}
            className="w-full bg-[#00a884] hover:bg-[#02906f] text-white text-sm py-2 h-8"
          >
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

