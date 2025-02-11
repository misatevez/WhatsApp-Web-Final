"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useToast } from "@/contexts/ToastContext"

export function ChatContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { addToast } = useToast()
  const phoneNumber = searchParams.get("phone")

  useEffect(() => {
    // Validate phone number format
    const phoneRegex = /^\+549\d{10}$/
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
      addToast({
        title: "Error",
        description: "Número de teléfono inválido",
        variant: "destructive"
      })
      router.push("/")
      return
    }

    // Check if phone number is saved in localStorage
    const savedPhone = localStorage.getItem("whatsapp_phone")
    if (!savedPhone || savedPhone !== phoneNumber) {
      addToast({
        title: "Error",
        description: "Sesión inválida",
        variant: "destructive"
      })
      router.push("/")
      return
    }
  }, [phoneNumber, router, addToast])

  if (!phoneNumber) {
    return null
  }

  return (
    <div className="h-[100dvh] w-full bg-[#0b141a] text-[#e9edef] overflow-hidden relative">
      <div className="flex flex-col h-full">
        {/* Add your chat UI components here */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-center text-[#8696a0]">
            Chat conectado para {phoneNumber}
          </div>
        </div>
      </div>
    </div>
  )
}

