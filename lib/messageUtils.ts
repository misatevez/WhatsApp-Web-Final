import { mockChats } from "./mockData"
import type { Message } from "@/types/interfaces"

export async function updateMessageStatus(chatId: string, messageId: string, newStatus: Message["status"]) {
  const chatIndex = mockChats.findIndex((chat) => chat.id === chatId)
  if (chatIndex !== -1) {
    const messageIndex = mockChats[chatIndex].messages?.findIndex((msg) => msg.id === messageId)
    if (messageIndex !== undefined && messageIndex !== -1) {
      mockChats[chatIndex].messages![messageIndex].status = newStatus
      mockChats[chatIndex].messages![messageIndex].receipts[newStatus] = new Date().toISOString()
    }
  }
}

export async function addMessageToChat(chatId: string, message: Message) {
  const chatIndex = mockChats.findIndex((chat) => chat.id === chatId)
  if (chatIndex !== -1) {
    mockChats[chatIndex].messages = [...(mockChats[chatIndex].messages || []), message]
    mockChats[chatIndex].lastMessage = message.content
    mockChats[chatIndex].timestamp = message.timestamp
    mockChats[chatIndex].unreadCount += 1
  }
}

export async function markMessagesAsRead(chatId: string, lastReadMessageId: string) {
  const chatIndex = mockChats.findIndex((chat) => chat.id === chatId)
  if (chatIndex !== -1) {
    mockChats[chatIndex].lastReadMessageId = lastReadMessageId
    mockChats[chatIndex].unreadCount = 0
    mockChats[chatIndex].messages?.forEach((msg) => {
      if (!msg.isOutgoing && msg.status !== "read") {
        msg.status = "read"
        msg.receipts.read = new Date().toISOString()
      }
    })
  }
}

export function getUnreadCount(messages: Message[], lastReadMessageId?: string): number {
  if (!lastReadMessageId) return messages.length
  const lastReadIndex = messages.findIndex((m) => m.id === lastReadMessageId)
  return lastReadIndex === -1 ? messages.length : messages.length - lastReadIndex - 1
}

