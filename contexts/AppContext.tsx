"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { appReducer } from "./appReducer"
import type { AppState, AppAction } from "../types/appTypes"

// Mantén tus imports para otras funciones que cargan adminProfile, etc.
import {
  fetchChats,
  fetchAdminProfile,
  fetchCategories,
  fetchUnknownContacts,
  updateAdminProfile,
} from "@/lib/firestore"

import { DEFAULT_AVATAR } from "@/constants/constants"

// Importaciones de Firestore para hacer la suscripción
import { db } from "@/lib/firebase"
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore"

const initialState: AppState = {
  chats: [],
  adminProfile: null,
  categories: [],
  selectedChatId: null,
  unknownContacts: [],
  activeTab: "chats",
  selectedCategories: [],
}

const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | undefined>(undefined)

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // 1) Carga inicial de datos (adminProfile, categorías, unknownContacts, etc.)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [chats, adminProfile, categories, unknownContacts] = await Promise.all([
          fetchChats(),         // << Suele ser redundante si luego suscribes en tiempo real, 
          fetchAdminProfile(),  //    pero puedes dejarlo si quieres mostrar algo inmediato
          fetchCategories(),
          fetchUnknownContacts(),
        ])

        console.log("Fetched data:", { chats, adminProfile, categories, unknownContacts })

        dispatch({ type: "SET_CHATS", payload: chats })

        let adminProfileData = adminProfile
        if (!adminProfileData) {
          const defaultProfile = {
            name: "Admin",
            avatar: DEFAULT_AVATAR,
            about: "Hey there! I'm using WhatsApp.",
          }
          await updateAdminProfile(defaultProfile)
          adminProfileData = defaultProfile
        }
        dispatch({ type: "UPDATE_ADMIN_PROFILE", payload: adminProfileData })

        dispatch({ type: "SET_CATEGORIES", payload: categories })
        dispatch({ type: "SET_UNKNOWN_CONTACTS", payload: unknownContacts })
      } catch (error) {
        console.error("Error loading initial data:", error)
      }
    }
    loadInitialData()
  }, [])

  // 2) Suscripción en tiempo real a la colección "chats"
  useEffect(() => {
    console.log("[AppProvider] Subscribing to real-time CHATS...")

    // Ejemplo: ordenados por 'timestamp' descendente.
    const chatsRef = collection(db, "chats")
    const q = query(chatsRef, orderBy("timestamp", "desc"))

    // onSnapshot se dispara en cada cambio (creación, actualización o borrado)
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedChats = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      console.log("[AppProvider] Real-time CHATS updated:", updatedChats)
      dispatch({ type: "SET_CHATS", payload: updatedChats })
    })

    // Cleanup de la suscripción al desmontar
    return () => {
      console.log("[AppProvider] Unsubscribe from CHATS")
      unsubscribe()
    }
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

