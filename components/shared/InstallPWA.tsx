"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Share, Plus } from "lucide-react"

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
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

    // Handle beforeinstallprompt for Android
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    
    // Show iOS prompt after a delay
    if (isIOSDevice && !isInStandaloneMode) {
      const timer = setTimeout(() => setShowInstallPrompt(true), 1000)
      return () => clearTimeout(timer)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  if (isStandalone || !showInstallPrompt) return null

  return (
    <Dialog open={showInstallPrompt} onOpenChange={setShowInstallPrompt}>
      <DialogContent className="bg-[#111b21] border-none text-[#e9edef] max-w-[280px] p-4">
        <DialogHeader>
          <DialogTitle className="text-center text-base">
            Instalar Cargatusfichas.com
          </DialogTitle>
        </DialogHeader>

        {isIOS ? (
          // iOS Instructions
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2 bg-[#2a3942] rounded-lg">
                <Share className="h-4 w-4 text-[#00a884] shrink-0" />
                <p className="text-xs">1. Toca el botón "Compartir"</p>
              </div>
              <div className="flex items-center gap-2 p-2 bg-[#2a3942] rounded-lg">
                <Plus className="h-4 w-4 text-[#00a884] shrink-0" />
                <p className="text-xs">2. "Agregar a Pantalla de inicio"</p>
              </div>
            </div>
            <Button
              onClick={() => setShowInstallPrompt(false)}
              className="w-full bg-[#00a884] hover:bg-[#02906f] text-white text-sm py-2 h-8"
            >
              Entendido
            </Button>
          </div>
        ) : (
          // Android Instructions
          <div className="space-y-4">
            <p className="text-sm text-[#8696a0] text-center">
              Instala Cargatusfichas.com para una mejor experiencia:
            </p>
            <ul className="text-sm space-y-2 list-disc list-inside text-[#8696a0]">
              <li>Acceso rápido desde inicio</li>
              <li>Pantalla completa</li>
              <li>Mejor rendimiento</li>
            </ul>
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => setShowInstallPrompt(false)}
                className="text-[#8696a0] hover:text-[#e9edef] hover:bg-[#2a3942]"
              >
                Más tarde
              </Button>
              <Button
                onClick={handleInstall}
                className="bg-[#00a884] hover:bg-[#02906f] text-white"
              >
                Instalar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

