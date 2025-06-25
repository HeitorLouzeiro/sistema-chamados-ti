import { useState, useCallback } from "react"

export interface Toast {
  id: string
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

const TOAST_REMOVE_DELAY = 5000

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, TOAST_REMOVE_DELAY)
    
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return {
    toasts,
    toast: addToast,
    dismiss: removeToast,
  }
}

// Hook singleton para uso global
let globalToastFn: ((toast: Omit<Toast, "id">) => void) | null = null

export const toast = (toastData: Omit<Toast, "id">) => {
  if (globalToastFn) {
    globalToastFn(toastData)
  } else {
    // Fallback para console se não estiver configurado
    console.log("Toast:", toastData)
  }
}

export const setGlobalToast = (toastFn: (toast: Omit<Toast, "id">) => void) => {
  globalToastFn = toastFn
}
