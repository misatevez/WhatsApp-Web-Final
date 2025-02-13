"use client"

import { useState } from "react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error?.message || "Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#111b21] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#202c33] rounded-2xl p-8 shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="relative w-20 h-20">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp Logo"
              fill
              priority
              className="object-contain"
            />
          </div>
        </div>

        <h2 className="text-[#e9edef] text-xl font-medium text-center mb-6">Admin Login</h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
            <p className="text-red-500 text-sm text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 bg-[#2a3942] text-[#d1d7db] placeholder-[#8696a0] border-none"
            required
            autoComplete="email"
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 bg-[#2a3942] text-[#d1d7db] placeholder-[#8696a0] border-none"
            required
            autoComplete="current-password"
          />
          <Button
            type="submit"
            className="w-full h-12 bg-[#00a884] hover:bg-[#02906f] text-white font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Login"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}

