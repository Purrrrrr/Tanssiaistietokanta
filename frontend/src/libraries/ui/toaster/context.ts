import { useSyncExternalStore } from 'react'

import { type Color } from '../types'

let idCounter = 0
let toastState: ToastData[] = []
const toastListeners = new Set<() => unknown>()

export function useToastStore() {
  return useSyncExternalStore<ToastData[]>(
    (listener) => {
      toastListeners.add(listener)
      return () => toastListeners.delete(listener)
    },
    () => toastState,
  )
}

function setToasts(replacer: (old: ToastData[]) => ToastData[]) {
  toastState = replacer(toastState)
  toastListeners.forEach(listener => listener())
}

export interface ToastData {
  id: number
  toast: ToastProps
  closing: boolean
  onClose: () => unknown
}

export interface ToastProps {
  message: React.ReactNode
  onDismiss?: (didTimeoutExpire: boolean) => void
  /** Milliseconds to wait before automatically dismissing toast. Default: 5000 */
  timeout?: number
  color?: Color
  isCloseButtonShown?: boolean
}

export function showToast(toast: ToastProps) {
  const id = ++idCounter
  const toastData = {
    toast,
    id,
    closing: false,
    onClose() {
      if (toastData.closing) return
      setToasts(toasts => toasts.map(toast => toast.id === id ? { ...toast, closing: true } : toast))
      setTimeout(() => setToasts(toasts => toasts.filter(toast => toast.id !== id)), 500)
    },
  }
  setTimeout(toastData.onClose, toast.timeout ?? 5000)
  setToasts(toasts => [...toasts, toastData])
}

export function showErrorToast(failMsg: string, e: { message: string }) {
  showToast({
    color: 'danger',
    message: `${failMsg} ${e.message}`,
    isCloseButtonShown: true,
    timeout: 30000,
  })
}
