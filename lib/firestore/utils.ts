import { Timestamp } from "firebase/firestore"
import { storage } from "../firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

export function formatTimestamp(
  timestamp?: Timestamp | Date | string | number | { seconds: number; nanoseconds: number } | null,
): string {
  if (!timestamp) return "Sin hora"

  if (typeof timestamp === "string" && /^\d{1,2}:\d{2}(?::\d{2})?$/.test(timestamp)) {
    const [hh, mm] = timestamp.split(":").map(Number)
    const now = new Date()
    now.setHours(hh, mm, 0, 0)
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (typeof timestamp === "object" && "seconds" in timestamp && "nanoseconds" in timestamp) {
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (timestamp instanceof Date) {
    return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (typeof timestamp === "string" || typeof timestamp === "number") {
    const date = new Date(timestamp)
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  }

  return "Sin hora"
}

export function formatDate(input: string | number): string {
  const date = new Date(input)
  return date.toLocaleDateString("es-ES", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

export async function uploadFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
  const storageRef = ref(storage, `uploads/${Date.now()}_${file.name}`)

  try {
    const uploadTask = uploadBytes(storageRef, file)

    if (onProgress) {
      uploadTask.on("state_changed", (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        onProgress(progress)
      })
    }

    await uploadTask
    const downloadURL = await getDownloadURL(storageRef)
    return downloadURL
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

