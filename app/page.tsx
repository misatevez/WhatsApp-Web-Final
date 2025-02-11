"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { sendWelcomeMessage } from "@/lib/firestore/messages"

export default function Page() {
  const { toast } = useToast()
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = React.useState("+54")
  const [verificationCode, setVerificationCode] = React.useState("")
  const [sentCode, setSentCode] = React.useState<string | null>(null)
  const [step, setStep] = React.useState<"phone" | "code">("phone")
  const [isLoading, setIsLoading] = React.useState(false)

  useEffect(() => {
    const savedPhone = localStorage.getItem("whatsapp_phone")
    if (savedPhone) {
      router.push(`/chat?phone=${encodeURIComponent(savedPhone)}`)
    }
  }, [router])

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value

    if (!value.startsWith("+54")) {
      value = "+54"
    }

    const digits = value.slice(3).replace(/\D/g, "")
    setPhoneNumber("+54" + digits)
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phoneNumber.trim() || phoneNumber.length < 14) {
      toast({
        title: "Error",
        description: "Por favor ingresa un número de teléfono válido",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch("/api/sendWhatsApp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: phoneNumber.trim() }),
      })

      let data
      const responseText = await response.text()
      console.log("Respuesta del servidor:", responseText)

      try {
        data = JSON.parse(responseText)
      } catch (error) {
        console.error("Error parsing JSON:", error)
        throw new Error("Error al procesar la respuesta del servidor: " + responseText)
      }

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      if (data.success) {
        setSentCode(data.verificationCode.toString())
        setStep("code")
        toast({
          title: "Código enviado",
          description: "Revisa tu WhatsApp para ver el código de verificación",
        })
      } else {
        throw new Error(data.error || "Error al enviar el código")
      }
    } catch (error: any) {
      console.error("Error sending code:", error)
      toast({
        title: "Error",
        description: error.message || "Error al enviar el código de verificación. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!verificationCode.trim() || !sentCode) {
      toast({
        title: "Error",
        description: "Por favor ingresa el código de verificación",
        variant: "destructive",
      })
      return
    }

    if (verificationCode === sentCode) {
      try {
        // Create or get chat document
        const chatRef = doc(db, "chats", phoneNumber)
        const chatDoc = await getDoc(chatRef)

        if (!chatDoc.exists()) {
          await setDoc(chatRef, {
            id: phoneNumber,
            phoneNumber: phoneNumber,
            name: "",
            lastMessage: "",
            timestamp: serverTimestamp(),
            unreadCount: 0,
            isAgendado: false,
            createdAt: serverTimestamp(),
          })

          await sendWelcomeMessage(phoneNumber)
        }

        localStorage.setItem("whatsapp_phone", phoneNumber)

        toast({
          title: "¡Verificación exitosa!",
          description: "Redirigiendo al chat...",
        })

        router.push(`/chat?phone=${encodeURIComponent(phoneNumber)}`)
      } catch (error: any) {
        console.error("Error creating chat:", error)
        toast({
          title: "Error",
          description: "Error al crear el chat",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Error",
        description: "Código incorrecto",
        variant: "destructive",
      })
      setTimeout(() => {
        setVerificationCode("")
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen bg-[#111b21] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#202c33] rounded-2xl p-8 shadow-lg">
        <div className="flex justify-center mb-6">
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp Logo"
            width={80}
            height={80}
          />
        </div>

        {step === "phone" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <Input
              type="tel"
              placeholder="+54 9 11 XXXX XXXX"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className="w-full h-12 bg-[#2a3942] text-[#d1d7db] placeholder:text-[#8696a0]"
              maxLength={14}
              disabled={isLoading}
              autoFocus
            />
            <Button
              type="submit"
              className="w-full h-12 bg-[#00a884] hover:bg-[#02906f] text-white font-semibold transition-all"
              disabled={isLoading || phoneNumber.length < 13}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Verificar número"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <Input
              type="text"
              placeholder="Ingresa el código de 6 dígitos"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full h-12 text-center text-2xl tracking-[0.5em] font-mono bg-[#2a3942] text-[#d1d7db] placeholder:text-[#8696a0]"
              maxLength={6}
              autoFocus
            />
            <Button
              type="submit"
              className="w-full h-12 bg-[#00a884] hover:bg-[#02906f] text-white font-semibold transition-all"
              disabled={verificationCode.length !== 6}
            >
              Verificar código
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-[#00a884] hover:text-[#02906f] transition-colors"
              onClick={() => {
                setStep("phone")
                setVerificationCode("")
              }}
            >
              Cambiar número
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

