import { mockChats } from "./mockData"

export async function agendarContacto(chatId: string, nombre: string) {
  const chatIndex = mockChats.findIndex((chat) => chat.id === chatId)
  if (chatIndex !== -1) {
    mockChats[chatIndex] = {
      ...mockChats[chatIndex],
      name: nombre,
      isAgendado: true,
    }
    console.log("Contacto agendado exitosamente")
  } else {
    console.error("Chat no encontrado")
  }
}

