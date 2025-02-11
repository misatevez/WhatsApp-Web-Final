import { db } from "../firebase"
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import type { Category } from "@/types/interfaces"

export async function fetchCategories(): Promise<Category[]> {
  console.log("fetchCategories called")
  const categoriesRef = collection(db, "categories")
  try {
    const querySnapshot = await getDocs(categoriesRef)
    const categories = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[]
    console.log("fetchCategories successful:", categories)
    return categories
  } catch (error) {
    console.error("Error in fetchCategories:", error)
    throw error
  }
}

export async function addCategory(category: Omit<Category, "id">): Promise<string> {
  console.log("addCategory called with:", category)
  const categoriesRef = collection(db, "categories")
  try {
    const docRef = await addDoc(categoriesRef, {
      ...category,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    console.log("addCategory successful, new ID:", docRef.id)
    return docRef.id
  } catch (error) {
    console.error("Error in addCategory:", error)
    throw error
  }
}

export async function updateCategory(categoryId: string, updates: Partial<Category>): Promise<void> {
  console.log("updateCategory called with:", { categoryId, updates })
  const categoryRef = doc(db, "categories", categoryId)
  try {
    await updateDoc(categoryRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
    console.log("updateCategory successful")
  } catch (error) {
    console.error("Error in updateCategory:", error)
    throw error
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  console.log("deleteCategory called with:", categoryId)
  const categoryRef = doc(db, "categories", categoryId)
  try {
    await deleteDoc(categoryRef)
    console.log("deleteCategory successful")
  } catch (error) {
    console.error("Error in deleteCategory:", error)
    throw error
  }
}

