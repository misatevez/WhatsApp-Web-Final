// Update interfaces.ts to include proper user profile type
export interface UserProfile {
  id?: string
  name: string
  phoneNumber: string
  avatar?: string
  about?: string
  createdAt?: string
  updatedAt?: string
}

export interface Chat {
  id: string
  name: string
  phoneNumber: string
  lastMessage: string
  timestamp: string
  online?: boolean
  avatar?: string
  photoURL?: string
  userAvatar?: string
  messages?: Message[]
  categories?: string[]
  about?: string
  unreadCount: number
  isAgendado: boolean
  lastReadMessageId?: string
  createdAt?: any
  updatedAt?: any
}

export interface Message {
  id: string
  content: string
  timestamp: string
  isOutgoing: boolean
  type: "text" | "image" | "document"
  filename?: string
  status: "sent" | "delivered" | "read"
  receipts: {
    sent: string
    delivered?: string
    read?: string
  }
}

export interface AdminProfile {
  name: string
  avatar: string
  about?: string
  online?: boolean
  categories?: Category[]
}

export interface Category {
  id: string
  name: string
  color: string
  count?: number
}

export interface AdminStatus {
  id: string
  imageUrl: string
  caption: string
  timestamp?: string
}

export interface UnknownContact {
  id: string
  phoneNumber: string
  timestamp: string
}

