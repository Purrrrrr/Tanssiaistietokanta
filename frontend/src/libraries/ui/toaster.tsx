import { useSyncExternalStore } from 'react'
import classNames from 'classnames'

import { type Color } from './types'

import { Popover } from 'libraries/overlays'

import { ColorClass } from './classes'

let idCounter = 0
let toastState: ToastData[] = []
const toastListeners = new Set<() => unknown>()

function setToasts(replacer: (old: ToastData[]) => ToastData[]) {
  toastState = replacer(toastState)
  toastListeners.forEach(listener => listener())
}

export function ToastContainer() {
  const toasts = useSyncExternalStore<ToastData[]>(
    (listener) => {
      toastListeners.add(listener)
      return () => toastListeners.delete(listener)
    },
    () => toastState,
  )

  return <section aria-live="assertive">
    <Popover type="manual" open={toasts.length > 0} className="flex left-1/2 flex-col gap-4 p-10 bg-transparent -translate-x-1/2">
      {toasts.map(({ id, ...rest }) => <Toast key={id} {...rest} />)}
    </Popover>
  </section>
}

function Toast({ onClose, closing, toast }: Omit<ToastData, 'id'>) {
  return <div className={classNames(
    'flex items-start gap-2 shadow-lg shadow-stone-500/40 starting:opacity-0 transition-opacity border-1 border-black/50 rounded-sm',
    ColorClass.boxColors[toast.intent ?? 'none'],
    closing && 'opacity-0',
  )}>

    <div className="p-3">{toast.message}</div>
    {
      toast.isCloseButtonShown !== false &&
        <button className="p-1 mt-1 cursor-pointer me-1 hover:bg-gray-800/20" onClick={onClose}>X</button>
    }
  </div>
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
  intent?: Color
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
    intent: 'danger',
    message: `${failMsg} ${e.message}`,
    isCloseButtonShown: true,
    timeout: 30000,
  })
}
