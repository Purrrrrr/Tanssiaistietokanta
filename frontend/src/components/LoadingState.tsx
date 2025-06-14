import {ComponentType, lazy, useEffect, useRef, useState, useSyncExternalStore} from 'react'
import {ApolloError, ApolloQueryResult} from '@apollo/client'

import {socket} from 'backend/feathers'

import {Button, GlobalSpinner, Icon} from 'libraries/ui'
import {useT, useTranslation} from 'i18n'

const connectionProblemMessageTimeout = 5000

export function GlobalLoadingState({children}) {
  const loading = useGlobalLoadingState()
  const [connected, setConnected] = useState(socket.connected)
  const [connectionTimeout, setConnectionTimeout] = useState(false)

  useEffect(() => {
    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
    }
  }, [])

  useEffect(() => {
    if (connected) {
      setConnectionTimeout(false)
      return
    }

    const id = setTimeout(() => setConnectionTimeout(true), connectionProblemMessageTimeout)
    return () => clearTimeout(id)
  }, [connected])

  return <>
    {children}
    <GlobalSpinner
      loading={loading || !connected}
      timeout={connectionTimeout}
      connectionTimeoutMessage={useTranslation('components.loadingState.connectionError')}/>
  </>
}

export function useGlobalLoadingAnimation() {
  return addGlobalLoadingAnimation
}

export function lazyLoadComponent<T>(loadComponent: () => Promise<{default: ComponentType<T>}>) {
  return lazy(() => addGlobalLoadingAnimation(loadComponent()))
}

const loadingPromises = new Set<Promise<unknown>>()
const stateListeners = new Set<() => unknown>()
const triggerListeners = () => stateListeners.forEach(listener => listener())

export function addGlobalLoadingAnimation<T>(promise: Promise<T>): Promise<T> {
  loadingPromises.add(promise)
  triggerListeners()
  promise.finally(() => {
    loadingPromises.delete(promise)
    triggerListeners()
  })
  return promise
}

function useGlobalLoadingState() {
  return useSyncExternalStore(
    (callback) => {
      stateListeners.add(callback)
      return () => stateListeners.delete(callback)
    },
    () => loadingPromises.size > 0,
  )
}

interface LoadingStateProps<Variables> {
  loading?: boolean,
  error?: ApolloError,
  refetch?: (variables?: Variables | undefined) => Promise<ApolloQueryResult<Record<string, unknown>>>
}

export function LoadingState<Variables>({loading, error, refetch} : LoadingStateProps<Variables>) {
  const t = useT('components.loadingState')
  useToggleGlobalLoadingAnimation(loading)
  if (error) {
    return <div className="flex flex-col gap-3 justify-center items-center h-full text-gray-500">
      <Icon className="text-gray-400" icon="error" iconSize={48} />
      <h2>{t('errorMessage')}</h2>
      <p>{error.message}</p>
      {refetch &&
        <Button
          text={t('tryAgain')}
          onClick={() => refetch()}
          intent="primary"
        />
      }
    </div>
  }
  return null
}

function useToggleGlobalLoadingAnimation(loading?: boolean) {
  const promise = useRef(new Promise(() => {}))
  useEffect(() => {
    const curPromise = promise.current
    if (loading) {
      loadingPromises.add(curPromise)
    } else {
      loadingPromises.delete(curPromise)
    }
    triggerListeners()
    return () => {
      loadingPromises.delete(curPromise)
      triggerListeners()
    }
  }, [loading])
}
