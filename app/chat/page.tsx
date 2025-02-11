"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import ChatContent from "./ChatContent"

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const phone = searchParams.get("phone")

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

  return <ChatContent phoneNumber={phone} />
}

