import * as React from "react"
import { X } from "lucide-react"

type ToastVariant = "default" | "destructive" | "success"

type ToastProps = {
  id?: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

type ToastContextType = {
  toasts: ToastProps[]
  addToast: (toast: ToastProps) => void
  removeToast: (id: string) => void
}

// Helper function to merge class names
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

// Create the context
const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

// Provider component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const addToast = React.useCallback((toast: ToastProps) => {
    const id = toast.id || Math.random().toString(36).substring(2, 9)
    setToasts((prevToasts) => [...prevToasts, { ...toast, id }])

    if (toast.duration !== Infinity) {
      setTimeout(() => {
        setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id))
      }, toast.duration || 5000)
    }
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  )
}

// Hook to use the toast functionality
export function useToast() {
  const context = React.useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  const toast = React.useCallback((props: ToastProps) => {
    context.addToast(props)
  }, [context])

  return {
    toast,
    toasts: context.toasts,
    dismiss: context.removeToast
  }
}

// Toast viewport component
function ToastViewport() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse p-4 sm:max-w-[420px] gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )
}

// Toast component
function Toast({
  variant = "default",
  title,
  description,
  id,
}: ToastProps) {
  const { dismiss } = useToast()

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full items-center justify-between rounded-md border p-4 pr-8 shadow-lg animate-in slide-in-from-right-full",
        variant === "default" ? "bg-white border-gray-200" : undefined,
        variant === "destructive" ? "border-red-500 bg-red-600 text-white" : undefined,
        variant === "success" ? "border-green-500 bg-green-600 text-white" : undefined
      )}
    >
      <div className="grid gap-1">
        {title && <div className="text-sm font-medium">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      <button
        className="absolute right-2 top-2 rounded-md p-1 text-gray-500 opacity-0 transition-opacity hover:text-gray-900 focus:opacity-100 focus:outline-none group-hover:opacity-100"
        onClick={() => id && dismiss(id)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}

// Export everything as a module
export {
  Toast,
  ToastViewport
}
