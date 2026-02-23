import { ComponentType, lazy, useEffect, useRef, useSyncExternalStore } from 'react'
import { ApolloError, ApolloQueryResult } from '@apollo/client'

import { useDelayedValue } from 'libraries/common/useDelayedValue'
import { Button, ColorClass, GlobalSpinner, H2 } from 'libraries/ui'
import { Error } from 'libraries/ui/icons'
import { useT, useTranslation } from 'i18n'

const connectionProblemMessageTimeout = 10000

interface GlobalLoadingStateProps {
  children: React.ReactNode
  connected: boolean
}

export function GlobalLoadingState({ children, connected }: GlobalLoadingStateProps) {
  const loading = useGlobalLoadingState()
  const connectedAWhileAgo = useDelayedValue(connected, connectionProblemMessageTimeout)
  const connectionTimeout = !connected && !connectedAWhileAgo

  return <>
    {children}
    <GlobalSpinner
      loading={loading || !connected}
      loadingMessage={useTranslation('components.loadingState.loading')}
      timeout={connectionTimeout}
      connectionTimeoutMessage={useTranslation('components.loadingState.connectionError')} />
  </>
}

export function useGlobalLoadingAnimation() {
  return addGlobalLoadingAnimation
}

export function lazyLoadComponent<T>(loadComponent: () => Promise<{ default: ComponentType<T> }>) {
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
  loading?: boolean
  error?: ApolloError
  refetch?: (variables?: Variables | undefined) => Promise<ApolloQueryResult<Record<string, unknown>>>
}

export function LoadingState<Variables>({ loading, error, refetch }: LoadingStateProps<Variables>) {
  const t = useT('components.loadingState')
  useToggleGlobalLoadingAnimation(loading)
  if (error) {
    return <div className={`flex flex-col gap-3 justify-center items-center h-full ${ColorClass.textMuted}`}>
      <Error className="text-gray-400" size={48} />
      <H2>{t('errorMessage')}</H2>
      <p>{error.message}</p>
      {refetch &&
        <Button
          text={t('tryAgain')}
          onClick={() => refetch()}
          color="primary"
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
