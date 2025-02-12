"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sticker, Plus } from "lucide-react"
import { fetchStickerPacks, type StickerPack } from "@/lib/firestore/stickers"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DynamicStickerPickerProps {
  onStickerSelect: (stickerUrl: string) => void
  disabled?: boolean
}

export function DynamicStickerPicker({ onStickerSelect, disabled }: DynamicStickerPickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [selectedPack, setSelectedPack] = useState(0)
  const [stickerPacks, setStickerPacks] = useState<StickerPack[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStickerPacks = async () => {
      try {
        setLoading(true)
        const packs = await fetchStickerPacks()
        setStickerPacks(packs)
      } catch (error) {
        console.error("Error loading sticker packs:", error)
      } finally {
        setLoading(false)
      }
    }

    if (showPicker) {
      loadStickerPacks()
    }
  }, [showPicker])

  const handleStickerClick = (stickerUrl: string) => {
    onStickerSelect(stickerUrl)
    setShowPicker(false)
  }

  return (
    <div className="relative">
      {/* Botón para abrir el selector de stickers */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-[#8696a0] hover:bg-[rgba(134,150,160,0.1)] h-10 w-10 sm:h-12 sm:w-12"
        onClick={() => setShowPicker(!showPicker)}
        disabled={disabled}
      >
        <Sticker className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>

      {/* Selector de stickers */}
      {showPicker && (
        <div className="absolute bottom-full left-0 mb-2 bg-[#202c33] rounded-lg shadow-lg w-[320px] overflow-hidden">
          {/* Pestañas de packs de stickers */}
          <div className="p-2 border-b border-[#2f3b44]">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex space-x-2">
                {stickerPacks.map((pack, index) => (
                  <Button
                    key={pack.id}
                    variant={selectedPack === index ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedPack(index)}
                    className="flex-shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors 
                    focus:outline-none focus:ring-2 focus:ring-[#00a884] focus:ring-offset-2 focus:ring-offset-[#202c33]"
                  >
                    {pack.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Contenedor de stickers */}
          <ScrollArea className="h-[320px] p-2">
            {loading ? (
              <div className="flex items-center justify-center h-full text-[#8696a0]">
                Cargando stickers...
              </div>
            ) : stickerPacks.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 justify-items-center">
                {stickerPacks[selectedPack]?.stickers.map((sticker) => (
                  <Button
                    key={sticker.id}
                    variant="ghost"
                    className="p-1 aspect-square w-full max-w-[80px] rounded-md hover:bg-[#2f3b44] 
                    flex items-center justify-center"
                    onClick={() => handleStickerClick(sticker.url)}
                  >
                    <img
                      src={sticker.url || "/placeholder.svg"}
                      alt="Sticker"
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </Button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-[#8696a0]">
                No hay stickers disponibles
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

