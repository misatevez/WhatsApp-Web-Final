import { WELCOME_MESSAGE } from "@/constants/constants"
import { db } from "../firebase"
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  writeBatch,
  query,
  orderBy,
  getDocs,
  limit,
  increment,
} from "firebase/firestore"

export const sendMessage = async (
  chatId: string,
  content: string,
  isOutgoing: boolean,
  type: "text" | "image" | "document" = "text",
  filename?: string,
): Promise<string> => {
  if (!chatId || !content.trim()) {
    console.error("[sendMessage] Invalid parameters:", { chatId, content })
    throw new Error("Invalid message parameters")
  }

  try {
    console.log("[sendMessage] Sending message:", { chatId, content, isOutgoing, type })

    // Create message object with proper UTF-8 encoding for emojis
    const messageData = {
      content: content.trim(),
      isOutgoing,
      type,
      timestamp: serverTimestamp(),
      status: "sent",
      receipts: {
        sent: new Date().toISOString(),
        delivered: null,
        read: null,
      },
      ...(filename && { filename }),
    }

    // Add message to messages subcollection
    const messagesRef = collection(db, `chats/${chatId}/messages`)
    const docRef = await addDoc(messagesRef, messageData)

    // Update chat metadata
    const chatRef = doc(db, "chats", chatId)
    await updateDoc(chatRef, {
      lastMessage: content.trim(),
      timestamp: serverTimestamp(),
      [`lastMessage${isOutgoing ? "Admin" : "User"}`]: content.trim(),
      [`lastMessage${isOutgoing ? "Admin" : "User"}Timestamp`]: serverTimestamp(),
      ...(isOutgoing ? {} : { unreadCount: increment(1) }),
    })

    console.log("[sendMessage] Message sent successfully:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("[sendMessage] Error sending message:", error)
    throw error
  }
}

export const sendWelcomeMessage = async (chatId: string): Promise<void> => {
  if (!chatId) {
    console.error("[sendWelcomeMessage] Invalid chat ID")
    throw new Error("Invalid chat ID")
  }

  try {
    // First check if there are any existing messages
    const messagesRef = collection(db, `chats/${chatId}/messages`)
    const q = query(messagesRef, limit(1))
    const snapshot = await getDocs(q)

    // Only send welcome message if there are no messages
    if (snapshot.empty) {
      console.log("[sendWelcomeMessage] Sending welcome message to chat:", chatId)

      // Send welcome message using the constant
      const messageId = await sendMessage(
        chatId,
        WELCOME_MESSAGE,
        true, // isOutgoing true for admin messages
        "text",
      )

      // Update chat metadata
      const chatRef = doc(db, "chats", chatId)
      await updateDoc(chatRef, {
        lastMessage: WELCOME_MESSAGE,
        lastMessageAdmin: WELCOME_MESSAGE,
        lastMessageAdminTimestamp: serverTimestamp(),
        timestamp: serverTimestamp(),
        unreadCount: 0, // Reset unread count for welcome message
      })

      console.log("[sendWelcomeMessage] Welcome message sent successfully:", messageId)
    } else {
      console.log("[sendWelcomeMessage] Chat already has messages, skipping welcome message")
    }
  } catch (error) {
    console.error("[sendWelcomeMessage] Error:", error)
    throw error
  }
}

export const resetUnreadCount = async (chatId: string): Promise<void> => {
  try {
    const chatRef = doc(db, "chats", chatId)
    await updateDoc(chatRef, {
      unreadCount: 0,
      lastReadByAdmin: serverTimestamp(),
    })

    // Get all unread messages
    const messagesRef = collection(db, `chats/${chatId}/messages`)
    const q = query(messagesRef, orderBy("timestamp", "desc"))
    const snapshot = await getDocs(q)

    // Create batch to update message statuses
    const batch = writeBatch(db)
    snapshot.docs.forEach((doc) => {
      const messageData = doc.data()
      if (!messageData.isOutgoing && messageData.status !== "read") {
        batch.update(doc.ref, {
          status: "read",
          "receipts.read": serverTimestamp(),
        })
      }
    })
    await batch.commit()
  } catch (error) {
    console.error("[resetUnreadCount] Error:", error)
    throw error
  }
}

export const markMessagesAsRead = async (chatId: string, lastMessageId: string): Promise<void> => {
  try {
    const messagesRef = collection(db, `chats/${chatId}/messages`)
    const q = query(messagesRef, orderBy("timestamp"))
    const snapshot = await getDocs(q)

    const batch = writeBatch(db)
    snapshot.docs.forEach((doc) => {
      const messageData = doc.data()
      if (doc.id <= lastMessageId && !messageData.isOutgoing && messageData.status !== "read") {
        batch.update(doc.ref, {
          status: "read",
          "receipts.read": serverTimestamp(),
        })
      }
    })

    await batch.commit()

    const chatRef = doc(db, "chats", chatId)
    await updateDoc(chatRef, {
      unreadCount: 0,
      lastReadMessageId: lastMessageId,
      lastReadByAdmin: serverTimestamp(),
    })
  } catch (error) {
    console.error("[markMessagesAsRead] Error:", error)
    throw error
  }
}

