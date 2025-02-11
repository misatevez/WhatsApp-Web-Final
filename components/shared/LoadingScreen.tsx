"use client"

import Image from "next/image"

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-[#111b21] flex flex-col items-center justify-center">
      <div className="relative w-16 h-16 mb-8">
        <Image
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          alt="WhatsApp"
          layout="fill"
          className="loading-pulse"
          priority
        />
      </div>
      <div className="w-48 h-1 bg-[#2a3942] rounded-full overflow-hidden">
        <div className="h-full bg-[#00a884] w-1/3 rounded-full animate-[loading_2s_ease-in-out_infinite]" />
      </div>
    </div>
  )
}

