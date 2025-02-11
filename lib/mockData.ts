import type { Chat, AdminProfile, Category, AdminStatus, Message } from "@/types/interfaces"

export const mockCategories: Category[] = [
  { id: "1", name: "VIP", color: "#FFD700" },
  { id: "2", name: "New Customer", color: "#90EE90" },
  { id: "3", name: "Support", color: "#ADD8E6" },
  { id: "4", name: "Sales Lead", color: "#FFA07A" },
]

const createMessage = (
  id: string,
  content: string,
  timestamp: string,
  isOutgoing: boolean,
  type: "text" | "image" | "document",
  status: "sent" | "delivered" | "read",
  filename?: string,
): Message => ({
  id,
  content,
  timestamp,
  isOutgoing,
  type,
  status,
  filename,
  receipts: {
    sent: new Date(timestamp).toISOString(),
    delivered:
      status === "delivered" || status === "read"
        ? new Date(new Date(timestamp).getTime() + 60000).toISOString()
        : undefined,
    read: status === "read" ? new Date(new Date(timestamp).getTime() + 120000).toISOString() : undefined,
  },
})

export const mockChats: Chat[] = [
  {
    id: "1",
    name: "Marcos222",
    phoneNumber: "+1234567890",
    lastMessage: "gracias",
    timestamp: "06:20",
    online: true,
    categories: ["1", "2"],
    unreadCount: 2,
    isAgendado: true,
    lastReadMessageId: "2",
    photoURL: "https://firebasestorage.googleapis.com/v0/b/cargatusfichas.firebasestorage.app/o/profiles%2F11111111_1739056079632.jpg?alt=media&token=26f755ee-0f3d-4b4d-9d62-8d6eddea8421",
    messages: [
      createMessage("1", "Hola, ¿cómo estás?", "2023-05-10T06:15:00Z", false, "text", "read"),
      createMessage("2", "Bien, gracias por preguntar", "2023-05-10T06:18:00Z", true, "text", "read"),
      createMessage("3", "gracias", "2023-05-10T06:20:00Z", false, "text", "delivered"),
      createMessage(
        "4",
        "https://firebasestorage.googleapis.com/v0/b/cargatusfichas.firebasestorage.app/o/uploads%2F1738968086371.png?alt=media&token=ab62f8e3-d344-42d8-bb13-4bee6f6065a3",
        "2023-05-10T10:30:00Z",
        false,
        "image",
        "delivered",
      ),
      createMessage(
        "5",
        "https://firebasestorage.googleapis.com/v0/b/cargatusfichas.firebasestorage.app/o/uploads%2F1738968112095.txt?alt=media&token=67fc0771-5136-4be8-a7e1-754a3e2a808d",
        "2023-05-10T10:35:00Z",
        true,
        "document",
        "sent",
        "sample.txt",
      ),
    ],
  },
  {
    id: "2",
    name: "Admin Support",
    phoneNumber: "+1987654321",
    lastMessage: "Welcome to the app! How can we help you?",
    timestamp: "09:58 p.m.",
    categories: ["3"],
    unreadCount: 0,
    isAgendado: true,
    lastReadMessageId: "1",
    photoURL: "https://api.dicebear.com/6.x/avataaars/svg?seed=AdminSupport",
    messages: [
      createMessage("1", "Welcome to the app! How can we help you?", "2023-05-10T21:58:00Z", true, "text", "delivered"),
    ],
  },
  {
    id: "3",
    name: "PRUEBA1950",
    phoneNumber: "+1122334455",
    lastMessage: "Archivo adjunto",
    timestamp: "09:58 p.m.",
    online: true,
    categories: ["2", "4"],
    unreadCount: 1,
    isAgendado: true,
    photoURL: "https://api.dicebear.com/6.x/avataaars/svg?seed=PRUEBA1950",
    messages: [createMessage("1", "Archivo adjunto", "2023-05-10T21:58:00Z", false, "text", "delivered")],
  },
  {
    id: "4",
    name: "Pepe",
    phoneNumber: "+5544332211",
    lastMessage: "como estas?",
    timestamp: "04:45",
    online: true,
    categories: ["1"],
    unreadCount: 0,
    isAgendado: true,
    lastReadMessageId: "1",
    photoURL: "https://api.dicebear.com/6.x/avataaars/svg?seed=Pepe",
    messages: [createMessage("1", "como estas?", "2023-05-11T04:45:00Z", false, "text", "read")],
  },
  {
    id: "5",
    name: "",
    phoneNumber: "+9876543210",
    lastMessage: "Hello, is this the right number?",
    timestamp: "10:30",
    unreadCount: 1,
    isAgendado: false,
    photoURL: "https://api.dicebear.com/6.x/avataaars/svg?seed=9876543210",
    messages: [
      createMessage("1", "Hello, is this the right number?", "2023-05-11T10:30:00Z", false, "text", "delivered"),
    ],
  },
  {
    id: "6",
    name: "",
    phoneNumber: "+1357924680",
    lastMessage: "I found your contact on a business card",
    timestamp: "Yesterday",
    unreadCount: 1,
    isAgendado: false,
    photoURL: "https://api.dicebear.com/6.x/avataaars/svg?seed=1357924680",
    messages: [
      createMessage("1", "I found your contact on a business card", "2023-05-10T15:00:00Z", false, "text", "delivered"),
    ],
  },
  {
    id: "7",
    name: "",
    phoneNumber: "+2468013579",
    lastMessage: "Are you available for a quick call?",
    timestamp: "2 days ago",
    unreadCount: 1,
    isAgendado: false,
    photoURL: "https://api.dicebear.com/6.x/avataaars/svg?seed=2468013579",
    messages: [
      createMessage("1", "Are you available for a quick call?", "2023-05-09T14:30:00Z", false, "text", "delivered"),
    ],
  },
]

export const mockAdminProfile: AdminProfile = {
  name: "LINEA 0800 24 HS 💻💜🩷✨",
  avatar:
    "https://firebasestorage.googleapis.com/v0/b/cargatusfichas.firebasestorage.app/o/admin%2Fprofile_1739029047878.png?alt=media&token=8613c1d3-6ed2-49d4-9660-3a1ebec5c5b0",
  about: "Cuenta oficial",
  categories: mockCategories,
  online: true,
}

export const mockStatuses: AdminStatus[] = [
  {
    id: "1",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/cargatusfichas.firebasestorage.app/o/admin%2Fstatus_1739039244609.PNG?alt=media&token=72536998-2844-4140-b9d9-b440b9072d1a",
    caption: "Aprovecha la promoción",
  },
  {
    id: "2",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/cargatusfichas.firebasestorage.app/o/admin%2Fstatus_1739039244610.PNG?alt=media&token=example-token",
    caption: "Nuevos productos disponibles",
  },
  {
    id: "3",
    imageUrl:
      "https://firebasestorage.googleapis.com/v0/b/cargatusfichas.firebasestorage.app/o/admin%2Fstatus_1739039244611.PNG?alt=media&token=another-example-token",
    caption: "Horario especial de atención",
  },
]

