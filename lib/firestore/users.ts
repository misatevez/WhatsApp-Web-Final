import { db, storage } from "../firebase"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import type { UserProfile } from "@/types/interfaces"

export async function fetchUserProfile(phoneNumber: string): Promise<UserProfile | null> {
  try {
    if (!phoneNumber) {
      throw new Error("Phone number is required")
    }

    const userRef = doc(db, "users", phoneNumber)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      return {
        id: userDoc.id,
        ...userDoc.data()
      } as UserProfile
    }
    return null
  } catch (error) {
    console.error("Error fetching user profile:", error)
    throw error
  }
}

export async function updateUserProfile(
  phoneNumber: string, 
  updates: Partial<UserProfile>
): Promise<void> {
  try {
    if (!phoneNumber) {
      throw new Error("Phone number is required")
    }

    // Create references
    const userRef = doc(db, "users", phoneNumber)
    const chatRef = doc(db, "chats", phoneNumber)

    // Clean updates by removing undefined/null values and validating data
    const cleanUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Convert any non-string values to string to avoid Firebase errors
        acc[key] = typeof value === 'string' ? value : String(value)
      }
      return acc
    }, {} as Record<string, any>)

    // Add required fields
    const timestamp = serverTimestamp()
    const userUpdates = {
      phoneNumber, // Always include phoneNumber
      ...cleanUpdates,
      updatedAt: timestamp
    }

    // Only include relevant fields for chat update
    const chatUpdates = {
      ...(cleanUpdates.name && { name: cleanUpdates.name }),
      ...(cleanUpdates.avatar && { userAvatar: cleanUpdates.avatar }),
      ...(cleanUpdates.about && { about: cleanUpdates.about }),
      updatedAt: timestamp
    }

    // Check if user exists first
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      // Create new user with initial data
      await setDoc(userRef, {
        ...userUpdates,
        createdAt: timestamp,
        name: cleanUpdates.name || '',
        about: cleanUpdates.about || '¡Hola! Estoy usando WhatsApp',
        avatar: cleanUpdates.avatar || ''
      })
    } else {
      // Update existing user
      await updateDoc(userRef, userUpdates)
    }

    // Only update chat if we have changes
    if (Object.keys(chatUpdates).length > 0) {
      const chatDoc = await getDoc(chatRef)
      if (chatDoc.exists()) {
        await updateDoc(chatRef, chatUpdates)
      }
    }

  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

export async function uploadUserAvatar(
  phoneNumber: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  try {
    if (!phoneNumber || !file) {
      throw new Error("Phone number and file are required")
    }

    if (!file.type.startsWith('image/')) {
      throw new Error("File must be an image")
    }

    // Create unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const filename = `avatar_${Date.now()}.${fileExtension}`
    const storageRef = ref(storage, `users/${phoneNumber}/avatars/${filename}`)
    
    const uploadTask = uploadBytesResumable(storageRef, file)
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          if (onProgress) {
            onProgress(progress)
          }
        },
        (error) => {
          console.error("Error uploading file:", error)
          reject(error)
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            
            // Update profile with new avatar URL
            await updateUserProfile(phoneNumber, {
              avatar: downloadURL
            })
            
            resolve(downloadURL)
          } catch (error) {
            console.error("Error getting download URL:", error)
            reject(error)
          }
        }
      )
    })
  } catch (error) {
    console.error("Error initiating upload:", error)
    throw error
  }
}

