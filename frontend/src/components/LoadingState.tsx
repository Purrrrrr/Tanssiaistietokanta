import {ComponentType, lazy, useEffect, useState, useSyncExternalStore} from 'react'
import {ApolloError, ApolloQueryResult} from '@apollo/client'

import {socket} from 'backend/feathers'

import {Button, GlobalSpinner, NonIdealState, Spinner} from 'libraries/ui'
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
const stateListeners = new Set<(loading: boolean) => unknown>()

export function addGlobalLoadingAnimation<T>(promise: Promise<T>): Promise<T> {
  loadingPromises.add(promise)
  promise.finally(() => { loadingPromises.delete(promise) })
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

interface LoadingStateProps {
  loading?: boolean,
  error?: ApolloError,
  refetch?: (variables?: Record<string, unknown> | undefined) => Promise<ApolloQueryResult<Record<string, unknown>>>
}

export function LoadingState({loading, error, refetch} : LoadingStateProps) {
  const t = useT('components.loadingState')
  if (loading) {
    return <Spinner size={100} /> //<NonIdealState icon={<Spinner />} />;
  }
  if (error) {
    return <NonIdealState icon="error"
      title={t('errorMessage')}
      description={error.message}
      action={refetch ? <Button text={t('tryAgain')} onClick={() => refetch()} intent="primary" /> : undefined}
    />
  }
  return null
}
