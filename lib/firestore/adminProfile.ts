import { db, storage } from "../firebase"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import type { AdminProfile } from "@/types/interfaces"

export async function fetchAdminProfile(): Promise<AdminProfile | null> {
  console.log("fetchAdminProfile called")
  const adminRef = doc(db, "adminProfile", "main")
  const adminDoc = await getDoc(adminRef)
  try {
    if (adminDoc.exists()) {
      console.log("fetchAdminProfile successful:", adminDoc.data())
      return adminDoc.data() as AdminProfile
    }
    console.log("fetchAdminProfile: Admin profile not found")
    return null
  } catch (error) {
    console.error("Error in fetchAdminProfile:", error)
    throw error
  }
}

export async function updateAdminProfile(profile: Partial<AdminProfile>): Promise<void> {
  console.log("updateAdminProfile called with:", profile)
  const adminRef = doc(db, "adminProfile", "main")
  try {
    const adminDoc = await getDoc(adminRef)
    if (adminDoc.exists()) {
      await updateDoc(adminRef, { ...profile, updatedAt: serverTimestamp() })
    } else {
      await setDoc(adminRef, { ...profile, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
    }
    console.log("updateAdminProfile successful")
  } catch (error) {
    console.error("Error in updateAdminProfile:", error)
    throw error
  }
}

export async function uploadProfilePicture(file: File, onProgress?: (progress: number) => void): Promise<string> {
  console.log("uploadProfilePicture called with file:", file.name)
  
  // Create a unique filename using timestamp
  const filename = `adminProfile/avatar_${Date.now()}_${file.name}`
  const storageRef = ref(storage, filename)
  
  try {
    // Create upload task
    const uploadTask = uploadBytesResumable(storageRef, file)
    
    // Return a promise that resolves with the download URL
    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Handle progress updates
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          console.log("Upload progress:", progress)
          if (onProgress) {
            onProgress(progress)
          }
        },
        (error) => {
          // Handle errors
          console.error("Error during upload:", error)
          reject(error)
        },
        async () => {
          try {
            // Get download URL when upload completes
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            console.log("Upload successful, URL:", downloadURL)
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

