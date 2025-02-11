"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import ChatContent from "./ChatContent"

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get("phone")

  useEffect(() => {
    // Prevent default browser behaviors
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      return (e.returnValue = "")
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    // Handle iOS PWA
    if (window.navigator.standalone) {
      document.addEventListener("touchstart", (e) => {
        e.preventDefault()
      }, { passive: false })
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  useEffect(() => {
    if (!phone) {
      const savedPhone = localStorage.getItem("whatsapp_phone")
      if (savedPhone) {
        router.push(`/chat?phone=${encodeURIComponent(savedPhone)}`)
      } else {
        router.push("/")
      }
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
