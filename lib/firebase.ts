import { initializeApp, getApps } from "firebase/app"
import { getFirestore, enableMultiTabIndexedDbPersistence } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth"

// Initialize Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase only if no apps exist and we're in the browser
let app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
let db: any = null
let storage: any = null
let auth: any = null

// Only initialize Firebase services in the browser
if (typeof window !== 'undefined') {
  db = getFirestore(app)
  storage = getStorage(app)
  auth = getAuth(app)

  // Enable offline persistence
  enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence enabled in first tab only')
    } else if (err.code === 'unimplemented') {
      console.warn('Current browser does not support persistence')
    }
  })

  // Set persistence to LOCAL
  setPersistence(auth, browserLocalPersistence).catch(error => {
    console.error('Error setting auth persistence:', error)
  })
}

export { db, storage, auth }

