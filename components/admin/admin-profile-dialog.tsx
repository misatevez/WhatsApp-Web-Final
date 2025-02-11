"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Edit2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { BaseDialog } from "@/components/shared/base-dialog"
import { updateAdminProfile, uploadProfilePicture } from "@/lib/firestore"
import type { AdminProfileDialogProps } from "@/types/interfaces"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/contexts/ToastContext"

export function AdminProfileDialog({ profile, onUpdate, children }: AdminProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState(profile.name)
  const [about, setAbout] = useState(profile.about || "¡Hola! Estoy usando WhatsApp")
  const [avatar, setAvatar] = useState(profile.avatar)
  const [isEditing, setIsEditing] = useState({ name: false, about: false })
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    setName(profile.name)
    setAbout(profile.about || "¡Hola! Estoy usando WhatsApp")
    setAvatar(profile.avatar)
  }, [profile])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsLoading(true)
      try {
        const file = e.target.files[0]
        setUploadProgress(0)
        const downloadURL = await uploadProfilePicture(file, (progress) => {
          setUploadProgress(progress)
        })
        setAvatar(downloadURL)
        setUploadProgress(100)
        addToast({
          title: "Éxito",
          description: "Foto de perfil actualizada correctamente",
        })
      } catch (error) {
        console.error("Error al subir foto de perfil:", error)
        addToast({
          title: "Error",
          description: "No se pudo actualizar la foto de perfil",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSave = async () => {
    if (!name.trim() || isLoading) return
    
    setIsLoading(true)
    try {
      await updateAdminProfile({ name, about, avatar })
      onUpdate(name, avatar, about)
      setIsOpen(false)
      setIsEditing({ name: false, about: false })
      addToast({
        title: "Éxito",
        description: "Perfil actualizado correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar perfil:", error)
      addToast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>{children}</div>
      <BaseDialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Configuración de Perfil">
        <div className="flex justify-center">
          <div className="relative group">
            <Avatar className="h-32 w-32 border-2 border-[#00a884] transition-transform group-hover:scale-105">
              <AvatarImage src={avatar} className="object-cover" />
              <AvatarFallback className="bg-[#202c33] text-2xl">{name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-[#00a884] rounded-full p-2.5 cursor-pointer hover:bg-[#017561] transition-colors shadow-lg"
            >
              <Camera className="h-5 w-5 text-white" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                disabled={isLoading}
              />
            </label>
          </div>
        </div>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="space-y-2">
            <div className="text-sm text-[#8696a0] text-center">Subiendo imagen...</div>
            <Progress value={uploadProgress} className="h-1 bg-[#2a3942]">
              <div 
                className="h-full bg-[#00a884] transition-all" 
                style={{ width: `${uploadProgress}%` }}
              />
            </Progress>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-[#8696a0] uppercase font-medium">Tu Nombre</label>
            <div className="flex items-center gap-2 bg-[#202c33] rounded-lg p-3">
              {isEditing.name ? (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent border-0 text-[#d1d7db] placeholder:text-[#8696a0] focus-visible:ring-0 p-0"
                  placeholder="Tu nombre"
                  autoFocus
                  disabled={isLoading}
                />
              ) : (
                <span className="flex-1 text-[#d1d7db]">{name}</span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-[#00a884] hover:text-[#017561] hover:bg-[#2a3942]"
                onClick={() => setIsEditing({ ...isEditing, name: !isEditing.name })}
                disabled={isLoading}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-[#8696a0] uppercase font-medium">Info</label>
            <div className="flex items-start gap-2 bg-[#202c33] rounded-lg p-3">
              {isEditing.about ? (
                <Textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="bg-transparent border-0 text-[#d1d7db] placeholder:text-[#8696a0] focus-visible:ring-0 p-0 min-h-[60px] resize-none"
                  placeholder="Info de perfil"
                  autoFocus
                  disabled={isLoading}
                />
              ) : (
                <span className="flex-1 text-[#d1d7db] whitespace-pre-wrap">{about}</span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-[#00a884] hover:text-[#017561] hover:bg-[#2a3942] shrink-0"
                onClick={() => setIsEditing({ ...isEditing, about: !isEditing.about })}
                disabled={isLoading}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="w-full bg-[#00a884] hover:bg-[#017561] text-white font-medium h-11 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            "Guardar Cambios"
          )}
        </Button>
      </BaseDialog>
    </>
  )
}

