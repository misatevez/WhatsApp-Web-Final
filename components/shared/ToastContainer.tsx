"use client"

import { useToast } from "@/contexts/ToastContext"
import { Toast, ToastViewport } from "@/components/ui/toast"

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast 
          key={id} 
          {...props} 
          onOpenChange={(open) => !open && removeToast(id)}
          className="bg-[#202c33] border-[#2a3942] text-[#e9edef]"
        >
          <div className="grid gap-1">
            {title && <div className="font-medium">{title}</div>}
            {description && <div className="text-sm opacity-90">{description}</div>}
          </div>
          {action}
        </Toast>
      ))}
      <ToastViewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
    </>
  )
}

