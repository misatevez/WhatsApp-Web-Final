"use client"

import { useState } from "react"
import { X, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/contexts/ToastContext"
import { useAppContext } from "@/contexts/AppContext"
import { addCategory, updateCategory, deleteCategory } from "@/lib/firestore"
import type { CategoryManagementDialogProps, Category } from "@/types/interfaces"

export function CategoryManagementDialog({ categories, isOpen, onClose }: CategoryManagementDialogProps) {
  const [newCategory, setNewCategory] = useState({ name: "", color: "#00a884" })
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { addToast } = useToast()
  const { dispatch } = useAppContext()

  const handleAddCategory = async () => {
    if (!newCategory.name.trim() || isLoading) return

    setIsLoading(true)
    try {
      const categoryData = {
        name: newCategory.name.trim(),
        color: newCategory.color,
        count: 0,
      }

      const categoryId = await addCategory(categoryData)

      // Dispatch action to update global state
      dispatch({
        type: "ADD_CATEGORY",
        payload: { ...categoryData, id: categoryId },
      })

      setNewCategory({ name: "", color: "#00a884" })
      addToast({
        title: "Éxito",
        description: "Categoría creada correctamente",
      })
    } catch (error) {
      console.error("Error al crear categoría:", error)
      addToast({
        title: "Error",
        description: "No se pudo crear la categoría",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim() || isLoading) return

    setIsLoading(true)
    try {
      await updateCategory(editingCategory.id, {
        name: editingCategory.name.trim(),
        color: editingCategory.color,
      })

      // Dispatch action to update global state
      dispatch({
        type: "UPDATE_CATEGORY",
        payload: {
          id: editingCategory.id,
          name: editingCategory.name.trim(),
          color: editingCategory.color,
        },
      })

      setEditingCategory(null)
      addToast({
        title: "Éxito",
        description: "Categoría actualizada correctamente",
      })
    } catch (error) {
      console.error("Error al actualizar categoría:", error)
      addToast({
        title: "Error",
        description: "No se pudo actualizar la categoría",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (isLoading) return

    setIsLoading(true)
    try {
      await deleteCategory(categoryId)

      // Dispatch action to update global state
      dispatch({
        type: "DELETE_CATEGORY",
        payload: categoryId,
      })

      addToast({
        title: "Éxito",
        description: "Categoría eliminada correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar categoría:", error)
      addToast({
        title: "Error",
        description: "No se pudo eliminar la categoría",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#111b21] border-none text-[#e9edef] max-w-md p-0">
        <DialogHeader className="bg-[#202c33] px-4 py-3 flex-row items-center justify-between">
          <DialogTitle>Gestionar Categorías</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-[#aebac1] hover:text-[#e9edef]">
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Nombre de la categoría"
              value={editingCategory ? editingCategory.name : newCategory.name}
              onChange={(e) =>
                editingCategory
                  ? setEditingCategory({ ...editingCategory, name: e.target.value })
                  : setNewCategory({ ...newCategory, name: e.target.value })
              }
              className="bg-[#2a3942] border-0 text-[#d1d7db] placeholder:text-[#8696a0]"
              disabled={isLoading}
            />
            <div className="flex items-center gap-3">
              <label htmlFor="color" className="text-sm text-[#8696a0]">
                Color:
              </label>
              <input
                type="color"
                id="color"
                value={editingCategory ? editingCategory.color : newCategory.color}
                onChange={(e) =>
                  editingCategory
                    ? setEditingCategory({ ...editingCategory, color: e.target.value })
                    : setNewCategory({ ...newCategory, color: e.target.value })
                }
                className="w-8 h-8 rounded cursor-pointer"
                disabled={isLoading}
              />
            </div>
          </div>

          <Button
            onClick={editingCategory ? handleEditCategory : handleAddCategory}
            className="w-full bg-[#00a884] hover:bg-[#02906f] text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : editingCategory ? (
              "Actualizar Categoría"
            ) : (
              "Agregar Categoría"
            )}
          </Button>

          {editingCategory && (
            <Button
              onClick={() => setEditingCategory(null)}
              className="w-full bg-[#2a3942] hover:bg-[#3a4a53] text-white"
              disabled={isLoading}
            >
              Cancelar Edición
            </Button>
          )}

          {/* Lista de categorías existentes */}
          <div className="space-y-2 mt-4">
            <h3 className="text-lg font-semibold text-[#e9edef]">Categorías Existentes</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                    <span className="font-medium text-[#e9edef]">{category.name}</span>
                    {category.count > 0 && <span className="text-xs text-[#8696a0]">({category.count})</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#8696a0] hover:text-[#e9edef] hover:bg-[#2a3942]"
                      onClick={() => setEditingCategory(category)}
                      disabled={isLoading}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#ef4444] hover:text-[#ef4444] hover:bg-[#ef444420]"
                      onClick={() => handleDeleteCategory(category.id)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

