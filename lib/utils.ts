import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Timestamp } from "firebase/firestore"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimestamp(
  timestamp: Timestamp | Date | string | number | { seconds: number; nanoseconds: number } | null | undefined,
): string {
  if (!timestamp) return "Sin hora"

  try {
    let date: Date

    // Handle Firestore Timestamp object
    if (typeof timestamp === "object" && timestamp !== null && "seconds" in timestamp) {
      const seconds = timestamp.seconds
      const nanoseconds = timestamp.nanoseconds || 0
      date = new Date(seconds * 1000 + nanoseconds / 1000000)
    }
    // Handle Date object
    else if (timestamp instanceof Date) {
      date = timestamp
    }
    // Handle string or number
    else if (typeof timestamp === "string" || typeof timestamp === "number") {
      // Check if it's a time string (HH:mm:ss)
      if (typeof timestamp === "string" && /^\d{1,2}:\d{2}(?::\d{2})?$/.test(timestamp)) {
        const [hours, minutes] = timestamp.split(":").map(Number)
        const now = new Date()
        now.setHours(hours, minutes, 0, 0)
        date = now
      } else {
        date = new Date(timestamp)
      }
    } else {
      return "Sin hora"
    }

    // Validate the date
    if (isNaN(date.getTime())) {
      return "Sin hora"
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  } catch (error) {
    console.error("Error formatting timestamp:", error, { timestamp })
    return "Sin hora"
  }
}

export function formatDate(input: string | number | Date | null | undefined): string {
  if (!input) return "Sin fecha"

  try {
    const date = input instanceof Date ? input : new Date(input)

    if (isNaN(date.getTime())) {
      return "Sin fecha"
    }

    return date.toLocaleDateString("es-ES", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error, { input })
    return "Sin fecha"
  }
}

