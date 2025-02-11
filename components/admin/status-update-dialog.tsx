"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, X, Trash2, ImageIcon } from "lucide-react"
import Image from "next/image"
import {
  addAdminStatus,
  uploadStatusImage,
  fetchAdminStatuses,
  deleteAdminStatus,
} from "@/lib/firestore"
import type { AdminStatus } from "@/types/interfaces"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/contexts/ToastContext"

export function StatusUpdateDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [caption, setCaption] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [statuses, setStatuses] = useState<AdminStatus[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const { addToast } = useToast()

  // Carga los estados existentes al montar el componente
  useEffect(() => {
    const loadStatuses = async () => {
      try {
        const fetchedStatuses = await fetchAdminStatuses()
        setStatuses(fetchedStatuses)
      } catch (error) {
        console.error("Error al cargar estados:", error)
        addToast({
          title: "Error",
          description: "No se pudieron cargar los estados",
          variant: "destructive",
        })
      }
    }
    loadStatuses()
  }, [addToast])

  /**
   * Maneja el cambio en el input de tipo file.
   * Sube la imagen y actualiza el progreso mediante el callback.
   */
  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      setIsLoading(true)
      try {
        const file = e.target.files[0]
        // Reinicia el progreso de carga
        setUploadProgress(0)
        // Sube la imagen y recibe la URL de descarga
        const downloadURL = await uploadStatusImage(file, (progress) => {
          setUploadProgress(progress)
        })
        setSelectedImage(downloadURL)
        setUploadProgress(100)
      } catch (error) {
        console.error("Error al subir imagen:", error)
        addToast({
          title: "Error",
          description: `No se pudo subir la imagen: ${
            error instanceof Error ? error.message : "Error desconocido"
          }`,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  /**
   * Publica un nuevo estado utilizando la imagen seleccionada y la descripción.
   */
  const handleUpload = async () => {
    if (!selectedImage || isLoading) return

    setIsLoading(true)
    try {
      const newStatus: Omit<AdminStatus, "id"> = {
        imageUrl: selectedImage,
        caption: caption || "Sin descripción",
        timestamp: new Date().toISOString(),
      }
      // Agrega el estado a Firestore y obtiene el ID
      const statusId = await addAdminStatus(newStatus)
      // Actualiza la lista local de estados
      setStatuses((prev) => [{ ...newStatus, id: statusId }, ...prev])
      // Reinicia los campos de imagen y descripción
      setSelectedImage(null)
      setCaption("")
      addToast({
        title: "Éxito",
        description: "Estado publicado correctamente",
      })
    } catch (error) {
      console.error("Error al publicar estado:", error)
      addToast({
        title: "Error",
        description: "No se pudo publicar el estado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Elimina un estado dado su ID.
   */
  const handleDeleteStatus = async (id: string) => {
    if (isLoading) return

    setIsLoading(true)
    try {
      await deleteAdminStatus(id)
      setStatuses((prev) => prev.filter((status) => status.id !== id))
      addToast({
        title: "Éxito",
        description: "Estado eliminado correctamente",
      })
    } catch (error) {
      console.error("Error al eliminar estado:", error)
      addToast({
        title: "Error",
        description: "No se pudo eliminar el estado",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Botón para abrir el diálogo */}
      <Button
        variant="ghost"
        size="icon"
        className="text-[#aebac1]"
        onClick={() => setIsOpen(true)}
      >
        <Camera className="h-5 w-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-[#111b21] border-none text-[#e9edef] max-w-md p-0">
          <DialogHeader className="bg-[#202c33] px-4 py-3 flex-row items-center justify-between">
            <DialogTitle className="text-lg">Gestionar Estados</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-[#aebac1] hover:text-[#e9edef]"
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogHeader>

          <div className="p-4 space-y-4">
            {/* Área de carga de imagen */}
            <div className="relative aspect-video bg-[#202c33] rounded-lg overflow-hidden">
              {selectedImage ? (
                <Image
                  src={selectedImage || "/placeholder.svg"}
                  alt="Vista previa"
                  layout="fill"
                  objectFit="contain"
                  className="transition-transform hover:scale-105"
                />
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-[#2a3942] transition-colors">
                  <ImageIcon className="h-12 w-12 text-[#00a884] mb-2" />
                  <span className="text-[#8696a0]">
                    Haz clic para subir una imagen
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={isLoading}
                  />
                </label>
              )}
            </div>

            {/* Indicador de progreso mientras se carga la imagen */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="text-sm text-[#8696a0] text-center">
                  Subiendo imagen...
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {/* Input para la descripción */}
            <Input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Agrega una descripción..."
              className="bg-[#2a3942] border-0 text-[#d1d7db] placeholder:text-[#8696a0] focus-visible:ring-0"
              disabled={isLoading || !selectedImage}
            />

            {/* Botón para publicar el estado */}
            <Button
              onClick={handleUpload}
              disabled={!selectedImage || isLoading}
              className="w-full bg-[#00a884] hover:bg-[#02906f] text-white disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Publicar Estado"
              )}
            </Button>

            {/* Listado de estados activos */}
            {statuses.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-[#8696a0] text-sm font-medium">
                  Estados Activos ({statuses.length})
                </h3>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {statuses.map((status) => (
                    <div
                      key={status.id}
                      className="flex items-center gap-3 bg-[#202c33] p-3 rounded-lg"
                    >
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden">
                        <Image
                          src={status.imageUrl || "/placeholder.svg"}
                          alt={status.caption}
                          layout="fill"
                          objectFit="cover"
                          className="transition-transform hover:scale-110"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#e9edef] truncate">
                          {status.caption}
                        </p>
                        <p className="text-xs text-[#8696a0]">
                          {new Date(status.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-[#ef4444] hover:text-[#ef4444] hover:bg-[#ef444420] flex-shrink-0"
                        onClick={() => handleDeleteStatus(status.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

