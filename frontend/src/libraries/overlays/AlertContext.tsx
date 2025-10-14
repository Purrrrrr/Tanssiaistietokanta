import { createContext, useCallback, useContext } from 'react'

import { useQueue } from 'libraries/i18n/useQueue'

import { Alert, AlertAction, AlertProps } from './Alert'

const AlertContextInner = createContext<ShowAlert>(async () => {
  throw new Error('No alert system')
})

type ShowAlertProps = Pick<AlertProps, 'title' | 'children' | 'button' | 'buttons'>
type ShowAlert = (alert: ShowAlertProps) => Promise<AlertAction>

export function AlertContext({ children }: { children: React.ReactNode }) {
  const [alerts, alertQueue] = useQueue<AlertProps>()
  const showAlert = useCallback( (alert: ShowAlertProps) => {
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
      <Alert key={alert.id} {...alert} />
    )}
  </AlertContextInner.Provider>
}

export function useAlerts() {
  return useContext(AlertContextInner)
}
