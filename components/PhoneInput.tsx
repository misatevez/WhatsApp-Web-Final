"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

export function PhoneInput({ value, onChange, disabled = false, className = "" }: PhoneInputProps) {
  const [inputValue, setInputValue] = useState(value)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value

    if (!newValue.startsWith("+54")) {
      newValue = "+54"
    }

    const digits = newValue.slice(3).replace(/\D/g, "")
    const formattedValue = "+54" + digits

    setInputValue(formattedValue)
    onChange(formattedValue)
  }

  return (
    <Input
      type="text"
      inputMode="tel"
      placeholder="+54 9 11 1234 5678"
      value={inputValue}
      onChange={handleInputChange}
      className={className}
      disabled={disabled}
      maxLength={14}
    />
  )
}

