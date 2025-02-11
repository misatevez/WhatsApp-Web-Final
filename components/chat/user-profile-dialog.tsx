"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"
import { BaseDialog } from "@/components/shared/base-dialog"
import type React from "react"

// EJEMPLO: tu default avatar
const DEFAULT_AVATAR =
  "https://firebasestorage.googleapis.com/v0/b/..."

interface ProfileData {
  name: string
  avatar: string
  phoneNumber: string
  photoURL?: string
}

interface UserProfileDialogProps {
  profile: ProfileData
  onUpdate: (newName: string, newAvatar: string, photoURL?: string) => void
  children: React.ReactNode
}

/** 
 * Función local para simular guardado en la DB. 
 * Ajusta según tu Firestore (updateDoc, setDoc, etc.).
 */
async function updateUserProfileDB(
  phoneNumber: string,
  newData: { name: string; avatar: string }
) {
  console.log("[updateUserProfileDB] Save to Firestore =>", phoneNumber, newData)
  // Realmente harías algo como:
  // const docRef = doc(db, "users", phoneNumber)
  // await updateDoc(docRef, { name: newData.name, avatar: newData.avatar })
  // ...
}

export function UserProfileDialog({ profile, onUpdate, children }: UserProfileDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState(profile.name)
  const [avatar, setAvatar] = useState(profile.photoURL || profile.avatar)

  // Manejo de archivo local
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader()
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setAvatar(evt.target.result as string)
        }
      }
      reader.readAsDataURL(e.target.files[0])
    }
  }

  // Al presionar “Save”
  const handleSave = async () => {
    try {
      // 1) Guardar en la DB
      await updateUserProfileDB(profile.phoneNumber, { name, avatar })
      // 2) Avisar al padre
      onUpdate(name, avatar, profile.photoURL)
      // 3) Cerrar
      setIsOpen(false)
    } catch (error) {
      console.error("[UserProfileDialog] Error al guardar:", error)
      // Muestra un toast o algo
    }
  }

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {children}
      </div>

      <BaseDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Profile Settings"
      >
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Avatar className="h-32 w-32">
              <AvatarImage src={avatar || DEFAULT_AVATAR} />
              <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-[#00a884] rounded-full p-2 cursor-pointer hover:bg-[#02906f]"
            >
              <Camera className="h-5 w-5 text-white" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <label className="text-xs text-[#8696a0] uppercase">Your Name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-[#2a3942] border-0 text-[#d1d7db] placeholder:text-[#8696a0] focus-visible:ring-0"
          />
        </div>

        <div className="space-y-2 mb-4">
          <label className="text-xs text-[#8696a0] uppercase">Phone Number</label>
          <Input
            value={profile.phoneNumber}
            readOnly
            className="bg-[#2a3942] border-0 text-[#d1d7db] focus-visible:ring-0"
          />
        </div>

        <Button
          onClick={handleSave}
          className="w-full bg-[#00a884] hover:bg-[#02906f] text-white"
        >
          Save
        </Button>
      </BaseDialog>
    </>
  )
}

