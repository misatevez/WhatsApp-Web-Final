import { useToast } from "@/contexts/ToastContext"
import { Toast, ToastProvider, ToastViewport } from "@/components/ui/toast"

export function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props} onOpenChange={(open) => !open && removeToast(id)}>
          <div className="grid gap-1">
            {title && <div className="font-medium">{title}</div>}
            {description && <div className="text-sm opacity-90">{description}</div>}
          </div>
          {action}
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}

