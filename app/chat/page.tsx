"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import ChatContent from "./ChatContent"

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get("phone")

  useEffect(() => {
    // Verificar si estamos en iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

    // Intentar entrar en modo fullscreen
    if (isIOS) {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {
          // Silenciar error si el fullscreen falla
        })
      }
    }

    // Ocultar la barra de navegación en iOS
    if (isIOS) {
      window.scrollTo(0, 1)
    }

    if (!phone) {
      const savedPhone = localStorage.getItem("whatsapp_phone")
      if (savedPhone) {
        router.push(`/chat?phone=${encodeURIComponent(savedPhone)}`)
      } else {
        router.push("/")
      }
    }

    // Prevenir el scroll y el rebote en iOS
    document.body.style.position = "fixed"
    document.body.style.width = "100%"
    document.body.style.height = "100%"
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.position = ""
      document.body.style.width = ""
      document.body.style.height = ""
      document.body.style.overflow = ""
    }
  }, [phone, router])

  if (!phone) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-[#0b141a] overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: 'url("https://static.whatsapp.net/rsrc.php/v4/yl/r/gi_DckOUM5a.png")',
          backgroundSize: "600px",
          backgroundRepeat: "repeat",
          backgroundPosition: "center",
        }}
      />
      <div
        className="relative h-full w-full"
        style={{
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
          paddingLeft: "env(safe-area-inset-left)",
          paddingRight: "env(safe-area-inset-right)",
        }}
      >
        <ChatContent phoneNumber={phone} />
      </div>
    </div>
  )
}
