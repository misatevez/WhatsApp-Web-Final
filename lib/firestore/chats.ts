import { db } from "../firebase"
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import type { Chat } from "@/types/interfaces"

export async function fetchChats(): Promise<Chat[]> {
  console.log("fetchChats called")
  const chatsRef = collection(db, "chats")
  const querySnapshot = await getDocs(chatsRef)
  try {
    const chats = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Chat[]
    console.log("fetchChats successful:", chats)
    return chats
  } catch (error) {
    console.error("Error in fetchChats:", error)
    throw error
  }
}

export async function fetchChat(chatId: string): Promise<Chat | null> {
  console.log("fetchChat called with:", { chatId })
  const chatRef = doc(db, "chats", chatId)
  const chatDoc = await getDoc(chatRef)
  if (chatDoc.exists()) {
    console.log("fetchChat successful:", chatDoc.data())
    return { id: chatDoc.id, ...chatDoc.data() } as Chat
  }
  console.log("fetchChat: Chat not found")
  return null
}

export async function upsertChat(chat: Chat): Promise<void> {
  console.log("upsertChat called with:", chat)
  const chatRef = doc(db, "chats", chat.id)
  try {
    await setDoc(
      chatRef,
      {
        ...chat,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
    console.log("upsertChat successful")
  } catch (error) {
    console.error("Error in upsertChat:", error)
    throw error
  }
}

export async function editContact(chatId: string, newName: string, categories: string[]): Promise<void> {
  console.log("editContact called with:", { chatId, newName, categories })
  const chatRef = doc(db, "chats", chatId)
  try {
    await updateDoc(chatRef, {
      name: newName,
      categories: categories,
      isAgendado: true,
      updatedAt: serverTimestamp(),
    })
    console.log("editContact successful")
  } catch (error) {
    console.error("Error in editContact:", error)
    throw error
  }
}

export async function blockContact(chatId: string): Promise<void> {
  console.log("blockContact called with:", chatId)
  const chatRef = doc(db, "chats", chatId)
  try {
    await updateDoc(chatRef, {
      isBlocked: true,
      blockedAt: serverTimestamp(),
    })
    console.log("blockContact successful")
  } catch (error) {
    console.error("Error in blockContact:", error)
    throw error
  }
}

export async function unblockContact(chatId: string): Promise<void> {
  console.log("unblockContact called with:", chatId)
  const chatRef = doc(db, "chats", chatId)
  try {
    await updateDoc(chatRef, {
      isBlocked: false,
      blockedAt: null,
    })
    console.log("unblockContact successful")
  } catch (error) {
    console.error("Error in unblockContact:", error)
    throw error
  }
}

