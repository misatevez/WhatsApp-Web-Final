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
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { IOSInstallPrompt } from "@/components/shared/IOSInstallPrompt"
import { InstallPWA } from "@/components/shared/InstallPWA"

export default function Page() {
  const { toast } = useToast()
  const router = useRouter()
  const [phoneNumber, setPhoneNumber] = React.useState("+54")
  const [verificationCode, setVerificationCode] = React.useState("")
  const [sentCode, setSentCode] = React.useState<string | null>(null)
  const [step, setStep] = React.useState<"phone" | "code">("phone")
  const [isLoading, setIsLoading] = React.useState(false)
  const [alert, setAlert] = React.useState<{
    type: "error" | "success"
    message: string
  } | null>(null)
  const [isIOS, setIsIOS] = React.useState(false)
  const [isStandalone, setIsStandalone] = React.useState(false)

  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const standalone = window.matchMedia("(display-mode: standalone)").matches
    setIsIOS(iOS)
    setIsStandalone(standalone)
  }, [])

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

  const showAlert = (type: "error" | "success", message: string) => {
    setAlert({ type, message })
    setTimeout(() => setAlert(null), 3000)
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!phoneNumber.trim() || phoneNumber.length < 14) {
      showAlert("error", "Por favor ingresa un número de teléfono válido (Ej: +54 9 11 1234 5678)")
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
        showAlert("success", "Código enviado. Revisa tu WhatsApp")
      } else {
        throw new Error(data.error || "Error al enviar el código")
      }
    } catch (error: any) {
      console.error("Error sending code:", error)
      showAlert("error", error.message || "Error al enviar el código de verificación")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!verificationCode.trim() || !sentCode) {
      showAlert("error", "Por favor ingresa el código de verificación")
      return
    }

    if (verificationCode === sentCode) {
      try {
        setIsLoading(true)
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
        showAlert("success", "¡Verificación exitosa!")

        setTimeout(() => {
          router.push(`/chat?phone=${encodeURIComponent(phoneNumber)}`)
        }, 1500)
      } catch (error: any) {
        console.error("Error creating chat:", error)
        showAlert("error", "Error al crear el chat")
      } finally {
        setIsLoading(false)
      }
    } else {
      showAlert("error", "Código incorrecto")
      setTimeout(() => {
        setVerificationCode("")
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen bg-[#111b21] flex items-center justify-center px-4 pt-safe-top pb-safe-bottom">
      {!isStandalone && (isIOS ? <IOSInstallPrompt /> : <InstallPWA />)}

      <div className="w-full max-w-md bg-[#202c33] rounded-2xl p-8 shadow-lg relative">
        {alert && (
          <div
            className={`absolute -top-16 left-0 right-0 mx-4 p-4 rounded-lg flex items-center gap-2 text-sm font-medium ${
              alert.type === "error" ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"
            }`}
          >
            {alert.type === "error" ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
            {alert.message}
          </div>
        )}

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
              placeholder="+54 9 11 1234 5678"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              className="w-full h-12 bg-[#2a3942] text-[#d1d7db] placeholder:text-[#8696a0] text-base"
              maxLength={14}
              disabled={isLoading}
              autoFocus
            />
            <Button
              type="submit"
              className="w-full h-12 bg-[#00a884] hover:bg-[#02906f] text-white font-semibold transition-all"
              disabled={isLoading || phoneNumber.length < 13}
            >
              {isLoading ? "Cargando..." : "Verificar número"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <Input
              type="text"
              placeholder="Código de 6 dígitos"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full h-12 text-center text-xl tracking-[0.3em] font-mono bg-[#2a3942] text-[#d1d7db] placeholder:text-[#8696a0] placeholder:text-base placeholder:tracking-normal"
              maxLength={6}
              autoFocus
            />
            <Button
              type="submit"
              className="w-full h-12 bg-[#00a884] hover:bg-[#02906f] text-white font-semibold transition-all"
              disabled={verificationCode.length !== 6 || isLoading}
            >
              {isLoading ? "Cargando..." : "Verificar código"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-[#00a884] hover:text-[#02906f] transition-colors"
              onClick={() => {
                setStep("phone")
                setVerificationCode("")
              }}
              disabled={isLoading}
            >
              Cambiar número
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

