import type { AppAction } from "../types/appTypes"
import type { Chat, AdminProfile, Category, Message, UnknownContact } from "../types/interfaces"
import {
  upsertChat,
  addMessageToChat,
  updateAdminProfile as updateAdminProfileFirestore,
  addCategory as addCategoryFirestore,
  updateCategory as updateCategoryFirestore,
  deleteCategory as deleteCategoryFirestore,
  removeUnknownContact as removeUnknownContactFirestore,
} from "@/lib/firestore"

export const setSelectedChat = (chatId: string | null): AppAction => ({
  type: "SET_SELECTED_CHAT",
  payload: chatId,
})

export const updateChat = (chat: Partial<Chat> & { id: string }): AppAction => {
  upsertChat(chat as Chat)
  return {
    type: "UPDATE_CHAT",
    payload: chat,
  }
}

export const addMessage = (chatId: string, message: Message): AppAction => {
  return {
    type: "ADD_MESSAGE",
    payload: { chatId, message },
  }
}

export const updateAdminProfile = (profile: Partial<AdminProfile>): AppAction => {
  updateAdminProfileFirestore(profile)
  return {
    type: "UPDATE_ADMIN_PROFILE",
    payload: profile,
  }
}

export const addCategory = (category: Category): AppAction => {
  addCategoryFirestore(category)
  return {
    type: "ADD_CATEGORY",
    payload: category,
  }
}

export const updateCategory = (category: Partial<Category> & { id: string }): AppAction => {
  updateCategoryFirestore(category.id, category)
  return {
    type: "UPDATE_CATEGORY",
    payload: category,
  }
}

export const deleteCategory = (categoryId: string): AppAction => {
  deleteCategoryFirestore(categoryId)
  return {
    type: "DELETE_CATEGORY",
    payload: categoryId,
  }
}

export const setChats = (chats: Chat[]): AppAction => ({
  type: "SET_CHATS",
  payload: chats,
})

export const setCategories = (categories: Category[]): AppAction => ({
  type: "SET_CATEGORIES",
  payload: categories,
})

export const setActiveTab = (tab: "chats" | "contacts"): AppAction => ({
  type: "SET_ACTIVE_TAB",
  payload: tab,
})

export const setSelectedCategories = (categories: string[]): AppAction => ({
  type: "SET_SELECTED_CATEGORIES",
  payload: categories,
})

export const toggleCategoryFilter = (categoryId: string): AppAction => ({
  type: "TOGGLE_CATEGORY_FILTER",
  payload: categoryId,
})

export const addUnknownContact = (contact: UnknownContact): AppAction => ({
  type: "ADD_UNKNOWN_CONTACT",
  payload: contact,
})

export const removeUnknownContact = (phoneNumber: string): AppAction => {
  removeUnknownContactFirestore(phoneNumber)
  return {
    type: "REMOVE_UNKNOWN_CONTACT",
    payload: phoneNumber,
  }
}

export const setUnknownContacts = (contacts: UnknownContact[]): AppAction => ({
  type: "SET_UNKNOWN_CONTACTS",
  payload: contacts,
})

