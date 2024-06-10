import {createContext, useCallback, useContext, useEffect, useState} from 'react'
import {ApolloError, ApolloQueryResult} from '@apollo/client'

import {socket} from 'backend/feathers'

import {Button, GlobalSpinner, NonIdealState, Spinner} from 'libraries/ui'
import {useT} from 'i18n'

export const StartLoadingContext = createContext<<T>(promise: Promise<T>) => Promise<T>>(p => p)

export function GlobalLoadingState({children}) {
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(socket.connected)
  const startLoading = useCallback(
    (promise) => {
      setLoading(true)
      promise
        .then(() => setLoading(false))
        .catch(() => setLoading(false))
      return promise
    },
    []
  )

  useEffect(() => {
    socket.on('connect', () => {
      setConnected(true)
    })
    socket.on('disconnect', () => {
      setConnected(false)
    })
  }, [])

  return <>
    <StartLoadingContext.Provider value={startLoading}>
      {children}
    </StartLoadingContext.Provider>
    <GlobalSpinner loading={loading || !connected}/>
  </>
}

export function useGlobalLoadingAnimation() {
  return useContext(StartLoadingContext)
}

interface LoadingStateProps {
  loading?: boolean,
  error?: ApolloError,
  refetch: (variables?: Record<string, unknown> | undefined) => Promise<ApolloQueryResult<Record<string, unknown>>>
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
      action={<Button text={t('tryAgain')} onClick={() => refetch()} intent="primary" />}
    />
  }
  return null
}
