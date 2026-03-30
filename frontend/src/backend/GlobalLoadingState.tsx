import { useEffect, useId, useSyncExternalStore } from 'react'

import { useDelayedValue } from 'libraries/common/useDelayedValue'
import { GlobalSpinner } from 'libraries/ui'
import { useTranslation } from 'i18n'

import { isConnected, subscribeToConnected } from './connection'

const connectionProblemMessageTimeout = 10000

interface GlobalLoadingStateProps {
  children: React.ReactNode
  appInitialized: boolean
}

export function GlobalLoadingState({ children, appInitialized }: GlobalLoadingStateProps) {
  const connected = useSyncExternalStore(subscribeToConnected, isConnected)
  const loading = useSyncExternalStore(subscribeToGlobalLoadingState, () => loadingObjects.size > 0)
  const connectedAWhileAgo = useDelayedValue(connected, connectionProblemMessageTimeout)
  const connectionTimeout = !connected && !connectedAWhileAgo

  return <>
    {children}
    <GlobalSpinner
      loading={loading || !connected || !appInitialized}
      loadingMessage={useTranslation('components.loadingState.loading')}
      timeout={connectionTimeout}
      connectionTimeoutMessage={useTranslation('components.loadingState.connectionError')} />
  </>
}

const loadingObjects = new Set<string | Promise<unknown>>()
const addLoadingObject = (object: string | Promise<unknown>) => {
  loadingObjects.add(object)
  triggerListeners()
}
const removeLoadingObject = (object: string | Promise<unknown>) => {
  loadingObjects.delete(object)
  triggerListeners()
}

const stateListeners = new Set<() => void>()
const triggerListeners = () => stateListeners.forEach(listener => listener())

const subscribeToGlobalLoadingState = (callback: () => void) => {
  stateListeners.add(callback)
  return () => stateListeners.delete(callback)
}

export function addGlobalLoadingAnimation<T>(promise: Promise<T>): Promise<T> {
  addLoadingObject(promise)
  promise.finally(() => removeLoadingObject(promise))
  return promise
}

export function useShowGlobalLoadingAnimation(loading?: boolean) {
  const id = useId()
  useEffect(() => {
    if (loading) {
      addLoadingObject(id)
    } else {
      removeLoadingObject(id)
    }
    return () => removeLoadingObject(id)
  }, [id, loading])
}
