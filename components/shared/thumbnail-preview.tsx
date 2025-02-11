"use client"

import Image from "next/image"
import { Download } from "lucide-react"

interface ThumbnailPreviewProps {
  content: string
  type: "text" | "image" | "document"
  filename?: string
  onImageClick?: (imageUrl: string) => void
}

export function ThumbnailPreview({ content, type, filename, onImageClick }: ThumbnailPreviewProps) {
  if (type === "image") {
    return (
      <div 
        className="cursor-pointer group relative max-w-[300px]"
        onClick={() => onImageClick?.(content)}
      >
        <div className="relative aspect-auto max-h-[300px] w-full overflow-hidden rounded-lg">
          <img
            src={content}
            alt="Vista previa"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
      </div>
    )
  }

  if (type === "document") {
    return (
      <div
        className="flex items-center bg-[#2a3942] rounded-lg p-3 hover:bg-[#3a4952] transition-colors cursor-pointer group"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <svg
              className="w-10 h-10 text-[#00a884] shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
            <div className="min-w-0">
              <p className="text-[#e9edef] text-sm font-medium truncate">{filename || "Documento"}</p>
              <p className="text-[#8696a0] text-xs">Documento</p>
            </div>
          </div>
        </div>
        <a 
          href={content}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[#00a884] hover:text-[#017561] p-2 rounded-full hover:bg-[#202c33] transition-colors"
        >
          <Download className="w-5 h-5" />
        </a>
      </div>
    )
  }

  return <p className="text-[#e9edef] text-sm">{content}</p>
}

