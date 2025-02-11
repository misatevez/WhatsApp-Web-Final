"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, User, setPersistence, browserLocalPersistence } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Set persistence to LOCAL
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        // After setting persistence, set up the auth state listener
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user)
          setLoading(false)
          
          // If user is authenticated, redirect to their chat
          if (user?.phoneNumber) {
            const phone = user.phoneNumber.replace("+", "")
            router.push(`/chat?phone=${phone}`)
          }
        })

        return () => unsubscribe()
      })
      .catch((error) => {
        console.error("Error setting persistence:", error)
        setLoading(false)
      })
  }, [router])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

