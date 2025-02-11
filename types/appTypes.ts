import type { Chat, AdminProfile, Category, Message, UnknownContact } from "./interfaces"

export interface AppState {
  chats: Chat[]
  adminProfile: AdminProfile
  categories: Category[]
  selectedChatId: string | null
  unknownContacts: UnknownContact[]
  activeTab: "chats" | "contacts"
  selectedCategories: string[]
}

export type AppAction =
  | { type: "SET_SELECTED_CHAT"; payload: string | null }
  | { type: "UPDATE_CHAT"; payload: Partial<Chat> & { id: string } }
  | { type: "ADD_MESSAGE"; payload: { chatId: string; message: Message } }
  | { type: "UPDATE_ADMIN_PROFILE"; payload: Partial<AdminProfile> }
  | { type: "ADD_CATEGORY"; payload: Category }
  | { type: "UPDATE_CATEGORY"; payload: Partial<Category> & { id: string } }
  | { type: "DELETE_CATEGORY"; payload: string }
  | { type: "SET_ACTIVE_TAB"; payload: "chats" | "contacts" }
  | { type: "SET_SELECTED_CATEGORIES"; payload: string[] }
  | { type: "TOGGLE_CATEGORY_FILTER"; payload: string }
  | { type: "ADD_UNKNOWN_CONTACT"; payload: UnknownContact }
  | { type: "REMOVE_UNKNOWN_CONTACT"; payload: string }
  | { type: "SET_CHATS"; payload: Chat[] }
  | { type: "SET_CATEGORIES"; payload: Category[] }

