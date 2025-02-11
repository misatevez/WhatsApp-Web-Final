"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { CategoryManagerProps } from "@/types/interfaces"

export function CategoryManager({ categories, onAddCategory, onDeleteCategory }: CategoryManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: "", color: "#000000" })

  const handleAddCategory = () => {
    if (newCategory.name) {
      onAddCategory({ ...newCategory, id: Date.now().toString() })
      setNewCategory({ name: "", color: "#000000" })
      setIsOpen(false)
    }
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="mb-4">
        <Plus className="mr-2 h-4 w-4" /> Add Category
      </Button>
      <div className="space-y-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between p-2 rounded"
            style={{ backgroundColor: category.color + "20" }}
          >
            <span className="font-medium" style={{ color: category.color }}>
              {category.name}
            </span>
            <Button variant="ghost" size="sm" onClick={() => onDeleteCategory(category.id)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#111b21] border-none text-[#e9edef]">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Input
              placeholder="Category Name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="bg-[#2a3942] border-0 text-[#d1d7db] placeholder:text-[#8696a0]"
            />
            <div className="flex items-center space-x-2">
              <label htmlFor="color" className="text-sm">
                Color:
              </label>
              <input
                type="color"
                id="color"
                value={newCategory.color}
                onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                className="w-8 h-8 rounded"
              />
            </div>
            <Button onClick={handleAddCategory} className="w-full bg-[#00a884] hover:bg-[#02906f] text-white">
              Add Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

