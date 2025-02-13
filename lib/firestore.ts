import { db, storage } from "./firebase"

// Import all functions from individual files
import * as chats from "./firestore/chats"
import * as messages from "./firestore/messages"
import * as adminProfile from "./firestore/adminProfile"
import * as categories from "./firestore/categories"
import * as unknownContacts from "./firestore/unknownContacts"
import * as adminStatuses from "./firestore/adminStatuses"
import * as utils from "./firestore/utils"

// Export the modules
export { db, storage, chats, messages, adminProfile, categories, unknownContacts, adminStatuses, utils }

// Re-export specific functions for backward compatibility and ease of use

// Chats
export const { fetchChats, fetchChat, upsertChat, editContact, blockContact, unblockContact } = chats

// Messages
export const { sendMessage, resetUnreadCount, markMessagesAsRead } = messages

// Admin Profile
export const { fetchAdminProfile, updateAdminProfile, uploadProfilePicture } = adminProfile

// Categories
export const { fetchCategories, addCategory, updateCategory, deleteCategory } = categories

// Unknown Contacts
export const { fetchUnknownContacts, addUnknownContact, removeUnknownContact } = unknownContacts

// Admin Statuses
export const {
  fetchAdminStatuses,
  addAdminStatus,
  updateAdminStatus,
  deleteAdminStatus,
  uploadStatusImage,
  deleteStatusImage,
} = adminStatuses

// Utils
export const { formatTimestamp, formatDate, uploadFile } = utils

