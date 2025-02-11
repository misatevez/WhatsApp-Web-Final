import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MessageSquare, Users, Settings } from "lucide-react"

export function Sidebar() {
  return (
    <div className="w-64 bg-[#202c33] border-r border-[rgba(134,150,160,0.15)] flex flex-col">
      <div className="p-4">
        <Input
          type="text"
          placeholder="Buscar o iniciar nuevo chat"
          className="w-full bg-[#2a3942] text-[#d1d7db] placeholder-[#8696a0]"
          startIcon={<Search className="h-5 w-5 text-[#8696a0]" />}
        />
      </div>
      <nav className="flex-1">
        <Button variant="ghost" className="w-full justify-start text-[#e9edef] hover:bg-[#2a3942]">
          <MessageSquare className="h-5 w-5 mr-3" />
          Chats
        </Button>
        <Button variant="ghost" className="w-full justify-start text-[#e9edef] hover:bg-[#2a3942]">
          <Users className="h-5 w-5 mr-3" />
          Contactos
        </Button>
        <Button variant="ghost" className="w-full justify-start text-[#e9edef] hover:bg-[#2a3942]">
          <Settings className="h-5 w-5 mr-3" />
          Configuración
        </Button>
      </nav>
    </div>
  )
}

