"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export function BlockedUserMessage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect after 3 seconds
    const timeout = setTimeout(() => {
      router.push("/")
    }, 3000)

    return () => clearTimeout(timeout)
  }, [router])

  return (
    <div className="min-h-screen bg-[#111b21] flex items-center justify-center p-4">
      <div className="bg-[#202c33] rounded-lg p-8 max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp"
            width={80}
            height={80}
            className="opacity-60"
          />
        </div>
        
        <h2 className="text-[#e9edef] text-xl font-medium">
          Acceso Bloqueado
        </h2>
        
        <p className="text-[#8696a0]">
          Lo sentimos, pero tu acceso ha sido bloqueado. Serás redirigido a la página principal en unos segundos.
        </p>

        <div className="w-12 h-12 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    </div>
  )
}

