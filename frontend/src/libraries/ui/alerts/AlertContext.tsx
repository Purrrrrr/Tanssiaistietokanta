import { useCallback } from 'react'

import type { AlertAction, AlertProps, ShowAlertProps } from './types'

import { useQueue } from 'libraries/common/useQueue'

import { Alert } from './Alert'
import { AlertContextInner } from './context'

export function AlertContext({ children }: { children: React.ReactNode }) {
  const [alerts, alertQueue] = useQueue<AlertProps>()
  const showAlert = useCallback((alert: ShowAlertProps) => {
    const { promise, resolve } = Promise.withResolvers<AlertAction>()
    const id = alertQueue.push({
      ...alert,
      isOpen: true,
      onChoose: resolve,
      onClose: () => alertQueue.remove(id),
    })
    return promise
  }, [alertQueue])

  return <AlertContextInner.Provider value={showAlert}>
    {children}
    {alerts.map(alert =>
      <Alert key={alert.id} {...alert} />,
    )}
  </AlertContextInner.Provider>
}
