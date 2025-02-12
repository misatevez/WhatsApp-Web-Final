import { collection, getDocs, addDoc, doc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { db, storage } from "@/lib/firebase"

export interface StickerPack {
  id: string
  name: string
  stickers: Sticker[]
}

export interface Sticker {
  id: string
  url: string
}

export async function fetchStickerPacks(): Promise<StickerPack[]> {
  try {
    const stickerPacksRef = collection(db, "stickerPacks")
    const stickerPacksSnapshot = await getDocs(stickerPacksRef)

    const stickerPacks: StickerPack[] = []

    for (const doc of stickerPacksSnapshot.docs) {
      const packData = doc.data()
      const stickersRef = collection(db, `stickerPacks/${doc.id}/stickers`)
      const stickersSnapshot = await getDocs(stickersRef)

      const stickers: Sticker[] = stickersSnapshot.docs.map((stickerDoc) => ({
        id: stickerDoc.id,
        url: stickerDoc.data().url,
      }))

      stickerPacks.push({
        id: doc.id,
        name: packData.name,
        stickers: stickers,
      })
    }

    return stickerPacks
  } catch (error) {
    console.error("Error fetching sticker packs:", error)
    return []
  }
}

export async function uploadSticker(packId: string, file: File): Promise<string> {
  try {
    // Si no se proporciona un packId, usamos "default"
    const actualPackId = packId || "default"

    // Primero, asegurémonos de que el pack existe
    const packRef = doc(db, "stickerPacks", actualPackId)
    const packSnap = await getDocs(packRef)

    if (!packSnap.exists()) {
      // Si el pack no existe, lo creamos
      await addDoc(collection(db, "stickerPacks"), { name: "Default Pack" })
    }

    const storageRef = ref(storage, `stickers/${actualPackId}/${file.name}`)
    await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(storageRef)

    const stickersRef = collection(db, `stickerPacks/${actualPackId}/stickers`)
    await addDoc(stickersRef, { url: downloadURL })

    return downloadURL
  } catch (error) {
    console.error("Error uploading sticker:", error)
    throw error
  }
}

export async function createStickerPack(name: string): Promise<string> {
  try {
    const packRef = await addDoc(collection(db, "stickerPacks"), { name })
    return packRef.id
  } catch (error) {
    console.error("Error creating sticker pack:", error)
    throw error
  }
}

