import { Suspense } from "react"
import { ToastProvider } from "@/components/ui/toast"
import { InstallPWA } from "@/components/shared/InstallPWA"
import { IOSInstallPrompt } from "@/components/shared/IOSInstallPrompt"
import type React from "react" // Added import for React

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="h-[100dvh] w-full bg-[#0b141a] text-[#e9edef] overflow-hidden relative">
          <InstallPWA />
          <IOSInstallPrompt />
          <div
            className="absolute inset-0 z-[1] opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage: 'url("https://static.whatsapp.net/rsrc.php/v4/yl/r/gi_DckOUM5a.png")',
              backgroundSize: "600px",
              backgroundRepeat: "repeat",
              backgroundPosition: "center",
            }}
          />

          <div className="relative z-10 h-full flex flex-col mx-auto max-w-7xl">{children}</div>
        </div>
      </Suspense>
    </ToastProvider>
  )
}

