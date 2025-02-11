"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { ToastProvider } from "@/contexts/ToastContext"
import { AppProvider } from "@/contexts/AppContext"

// Dynamically import components to avoid hydration issues
const AdminDashboardContent = dynamic(
  () => import("@/components/admin/AdminDashboardContent").then((mod) => ({ default: mod.AdminDashboardContent })),
  { ssr: false },
)

const LoginForm = dynamic(() => import("@/components/admin/LoginForm").then((mod) => ({ default: mod.LoginForm })), {
  ssr: false,
})

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#111b21] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#00a884] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <LoginForm />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AppProvider>
        <ToastProvider>
          <AdminDashboardContent />
        </ToastProvider>
      </AppProvider>
    </Suspense>
  )
}

