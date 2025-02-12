"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sticker } from "lucide-react"

interface StickerPickerProps {
  onStickerSelect: (stickerUrl: string) => void
  disabled?: boolean
}

const STICKER_PACKS = [
  {
    name: "Emojis",
    stickers: [
      "/stickers/emoji-1.png",
      "/stickers/emoji-2.png",
      "/stickers/emoji-3.png",
      // Add more sticker URLs as needed
    ],
  },
  {
    name: "Animals",
    stickers: [
      "/stickers/animal-1.png",
      "/stickers/animal-2.png",
      "/stickers/animal-3.png",
      // Add more sticker URLs as needed
    ],
  },
  // Add more sticker packs as needed
]

export function StickerPicker({ onStickerSelect, disabled }: StickerPickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  const [selectedPack, setSelectedPack] = useState(0)

  const handleStickerClick = (stickerUrl: string) => {
    onStickerSelect(stickerUrl)
    setShowPicker(false)
  }

  return (
    <div className="relative">
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
      {showPicker && (
        <div className="absolute bottom-full right-0 mb-2 bg-[#2a3942] rounded-lg shadow-lg p-2 w-64">
          <div className="flex mb-2 space-x-2 overflow-x-auto">
            {STICKER_PACKS.map((pack, index) => (
              <Button
                key={pack.name}
                variant={selectedPack === index ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSelectedPack(index)}
              >
                {pack.name}
              </Button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {STICKER_PACKS[selectedPack].stickers.map((stickerUrl, index) => (
              <Button key={index} variant="ghost" className="p-1" onClick={() => handleStickerClick(stickerUrl)}>
                <img src={stickerUrl || "/placeholder.svg"} alt={`Sticker ${index + 1}`} className="w-full h-auto" />
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

