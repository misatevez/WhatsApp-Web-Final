import { Search, MoreVertical } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface SearchBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export function SearchBar({ searchQuery, setSearchQuery }: SearchBarProps) {
  return (
    <div className="p-2 bg-[#111b21] relative z-10">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8696a0]" />
          <Input
            placeholder="Buscar o iniciar nuevo chat"
            className="bg-[#202c33] border-0 text-[#d1d7db] placeholder:text-[#8696a0] h-9 pl-10 pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 text-[#8696a0] h-7 w-7"
              onClick={() => setSearchQuery("")}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <a 
          href="https://api.whatsapp.com/send/?phone=5493584877949"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-9 h-9 rounded-md hover:bg-[#202c33] transition-colors"
        >
          <Image
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp"
            width={24}
            height={24}
            className="opacity-60 hover:opacity-80 transition-opacity"
          />
        </a>
      </div>
    </div>
  )
}

