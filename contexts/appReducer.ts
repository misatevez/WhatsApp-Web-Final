// contexts/appReducer.ts

import { AppState, AppAction } from '@/types/appTypes'

export function appReducer(state: AppState, action: AppAction): AppState {
  console.log("[AppReducer] Action dispatched:", action.type, action.payload)
  switch (action.type) {
    case 'ADD_MESSAGE':
      const { chatId, message } = action.payload
      console.log("[AppReducer] Adding message to chat:", chatId, message)
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [...chat.messages, message],
                lastMessage: message.content,
                timestamp: new Date().toISOString()
              }
            : chat
        )
      }
    case 'UPDATE_CHAT':
      console.log("[AppReducer] Updating chat:", action.payload)
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat.id === action.payload.id ? { ...chat, ...action.payload } : chat
        )
      }
    case 'SET_SELECTED_CHAT':
      console.log("[AppReducer] Setting selected chat:", action.payload)
      return { ...state, selectedChatId: action.payload }
    case 'UPDATE_ADMIN_PROFILE':
      console.log("[AppReducer] Updating admin profile:", action.payload)
      return { ...state, adminProfile: { ...state.adminProfile, ...action.payload } }
    case 'ADD_CATEGORY':
      console.log("[AppReducer] Adding category:", action.payload)
      return { ...state, categories: [...state.categories, action.payload] }
    case 'UPDATE_CATEGORY':
      console.log("[AppReducer] Updating category:", action.payload)
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id ? { ...category, ...action.payload } : category
        )
      }
    case 'DELETE_CATEGORY':
      console.log("[AppReducer] Deleting category:", action.payload)
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload),
        chats: state.chats.map(chat => ({
          ...chat,
          categories: chat.categories?.filter(id => id !== action.payload)
        }))
      }
    case 'SET_ACTIVE_TAB':
      console.log("[AppReducer] Setting active tab:", action.payload)
      return { ...state, activeTab: action.payload }
    case 'SET_SELECTED_CATEGORIES':
      console.log("[AppReducer] Setting selected categories:", action.payload)
      return { ...state, selectedCategories: action.payload }
    case 'TOGGLE_CATEGORY_FILTER':
      console.log("[AppReducer] Toggling category filter:", action.payload)
      return {
        ...state,
        selectedCategories: state.selectedCategories.includes(action.payload)
          ? state.selectedCategories.filter(id => id !== action.payload)
          : [...state.selectedCategories, action.payload]
      }
    case 'ADD_UNKNOWN_CONTACT':
      console.log("[AppReducer] Adding unknown contact:", action.payload)
      return { ...state, unknownContacts: [...state.unknownContacts, action.payload] }
    case 'REMOVE_UNKNOWN_CONTACT':
      console.log("[AppReducer] Removing unknown contact:", action.payload)
      return {
        ...state,
        unknownContacts: state.unknownContacts.filter(contact => contact.phoneNumber !== action.payload)
      }
    case 'SET_CHATS':
      console.log("[AppReducer] Setting chats:", action.payload)
      return { ...state, chats: action.payload }
    case 'SET_CATEGORIES':
      console.log("[AppReducer] Setting categories:", action.payload)
      return { ...state, categories: action.payload }
    default:
      return state
  }
}

