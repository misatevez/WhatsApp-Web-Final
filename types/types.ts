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

