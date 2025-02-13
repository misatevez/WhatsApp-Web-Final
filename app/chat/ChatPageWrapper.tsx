"use client"

import { useSearchParams } from "next/navigation"
import ChatContent from "./ChatContent"

export default function ChatPageWrapper() {
  const searchParams = useSearchParams()
  const phone = searchParams.get("phone")

  // You can use the phone number here if needed
  console.log("Phone number:", phone)

  return <ChatContent phoneNumber={phone} />
}

