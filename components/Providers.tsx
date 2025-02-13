"use client"

import { AppProvider } from "@/contexts/AppContext"
import { AuthProvider } from "@/contexts/auth-context"
import { ToastProvider } from "@/contexts/ToastContext"

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppProvider>
        <ToastProvider>{children}</ToastProvider>
      </AppProvider>
    </AuthProvider>
  )
}

