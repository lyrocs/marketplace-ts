import { useState, useCallback, useEffect } from 'react'
import type { ToastProps, ToastActionElement } from '@nextrade/ui'

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterId = string
type ToasterToast = ToastProps & {
  id: ToasterId
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

// Simple global state via a singleton
let listeners: Array<(state: ToasterToast[]) => void> = []
let memoryState: ToasterToast[] = []

function dispatch(toast: ToasterToast) {
  memoryState = [...memoryState, toast].slice(-TOAST_LIMIT)
  listeners.forEach((listener) => listener(memoryState))
}

function remove(id: ToasterId) {
  memoryState = memoryState.filter((t) => t.id !== id)
  listeners.forEach((listener) => listener(memoryState))
}

export function useToast() {
  const [toasts, setToasts] = useState<ToasterToast[]>(memoryState)

  useEffect(() => {
    listeners.push(setToasts)
    return () => {
      listeners = listeners.filter((l) => l !== setToasts)
    }
  }, [])

  const toast = useCallback(({ title, description, variant, action }: {
    title?: string
    description?: string
    variant?: 'default' | 'destructive' | 'success'
    action?: ToastActionElement
  }) => {
    const id = genId()
    dispatch({ id, title, description, variant, action, open: true, onOpenChange: (open) => { if (!open) remove(id) } })
    return { id, dismiss: () => remove(id) }
  }, [])

  const dismiss = useCallback((toastId?: ToasterId) => {
    if (toastId) {
      remove(toastId)
    } else {
      memoryState.forEach((t) => remove(t.id))
    }
  }, [])

  return { toasts, toast, dismiss }
}
