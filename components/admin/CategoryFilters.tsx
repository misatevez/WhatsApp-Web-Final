import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Category } from "@/types/interfaces"

interface CategoryFiltersProps {
  categories: Category[]
  selectedCategories: string[]
  onCategoryClick: (categoryId: string) => void
}

export function CategoryFilters({ categories, selectedCategories, onCategoryClick }: CategoryFiltersProps) {
  return (
    <div className="px-2 pb-2 flex flex-wrap gap-2 relative z-10 bg-[#111b21]">
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "text-xs",
          selectedCategories.length === 0 ? "bg-[#00a884] text-white" : "bg-[#202c33] text-[#aebac1]",
        )}
        onClick={() => onCategoryClick("")}
      >
        Todos
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant="outline"
          size="sm"
          className={cn(
            "text-xs",
            selectedCategories.includes(category.id) ? "bg-[#00a884] text-white" : "bg-[#202c33] text-[#aebac1]",
          )}
          style={{
            borderColor: category.color,
            backgroundColor: selectedCategories.includes(category.id) ? category.color : undefined,
          }}
          onClick={() => onCategoryClick(category.id)}
        >
          {category.name}
          {category.count > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-opacity-20 bg-white">{category.count}</span>
          )}
        </Button>
      ))}
    </div>
  )
}

