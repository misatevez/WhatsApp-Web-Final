"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ImageIcon, Camera, File, Send } from "lucide-react"
import Image from "next/image"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"
import type { AttachmentPickerProps } from "@/types/interfaces"
import { Progress } from "@/components/ui/progress"

export function AttachmentPicker({ show, onToggle, onFileSelect, disabled }: AttachmentPickerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [comment, setComment] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => setPreviewUrl(e.target?.result as string)
        reader.readAsDataURL(file)
      } else {
        setPreviewUrl(null)
      }
      setShowPreview(true)
    }
  }

const handleSend = async () => {
  if (selectedFile && !isLoading) {
    setIsLoading(true)
    try {
      const storageRef = ref(storage, `uploads/${Date.now()}_${selectedFile.name}`)
      const uploadTask = uploadBytesResumable(storageRef, selectedFile)

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          setUploadProgress(progress)
        },
        (error) => {
          console.error("Error during upload:", error)
          throw error
        }
      )

      await uploadTask
      const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)

      const type = selectedFile.type.startsWith("image/") ? "image" : "document"
      await onFileSelect(downloadURL, type)

      if (comment.trim()) {
        await onFileSelect(comment.trim(), "text")
      }

      // Restablecer estado y cerrar modales
      setSelectedFile(null)
      setPreviewUrl(null)
      setShowPreview(false)
      setComment("")
      setUploadProgress(0)

      // Asegurarse de cerrar el Popover solo si está abierto
      if (show) {
        onToggle(false)
      }

    } catch (error) {
      console.error("Error uploading file:", error)
    } finally {
      setIsLoading(false)
    }
  }
}



  return (
    <>
      <Popover open={show} onOpenChange={onToggle}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="text-[#8696a0] hover:bg-[rgba(134,150,160,0.1)]"
          >
            <File className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 bg-[#233138] border border-[#233138] p-1">
          <div className="flex flex-col">
            <label className="flex items-center gap-3 px-3 py-2 hover:bg-[#182229] cursor-pointer rounded transition-colors">
              <ImageIcon className="h-5 w-5 text-[#8696a0]" />
              <span className="text-[#d1d7db] text-sm">Fotos y Videos</span>
              <input type="file" accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
            </label>
            <label className="flex items-center gap-3 px-3 py-2 hover:bg-[#182229] cursor-pointer rounded transition-colors">
              <Camera className="h-5 w-5 text-[#8696a0]" />
              <span className="text-[#d1d7db] text-sm">Cámara</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
            </label>
            <label className="flex items-center gap-3 px-3 py-2 hover:bg-[#182229] cursor-pointer rounded transition-colors">
              <File className="h-5 w-5 text-[#8696a0]" />
              <span className="text-[#d1d7db] text-sm">Documento</span>
              <input type="file" className="hidden" onChange={handleFileChange} />
            </label>
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="bg-[#111b21] border-none text-[#e9edef] max-w-md p-0">
          <DialogHeader className="bg-[#202c33] px-4 py-3">
            <DialogTitle>Vista previa</DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4">
            {previewUrl ? (
              <div className="relative aspect-square w-full">
                <Image src={previewUrl} alt="Vista previa" layout="fill" objectFit="contain" />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center bg-[#202c33] p-4 rounded-lg">
                <File className="h-12 w-12 text-[#8696a0] mb-2" />
                <span className="text-[#d1d7db] text-sm">Vista previa no disponible</span>
              </div>
            )}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <Progress value={uploadProgress} className="w-full" />
            )}
            <div className="flex items-center gap-2">
              <Input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Agregar comentario"
                className="flex-grow bg-[#2a3942] border-none text-[#d1d7db] placeholder:text-[#8696a0]"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSend} 
                className="bg-[#00a884] hover:bg-[#02906f]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

