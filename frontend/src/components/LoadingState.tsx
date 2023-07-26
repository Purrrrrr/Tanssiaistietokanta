import React, {createContext, useCallback, useContext, useState} from 'react'
import {ApolloError, ApolloQueryResult} from '@apollo/client'

import {Button, GlobalSpinner, NonIdealState, Spinner} from 'libraries/ui'

export const StartLoadingContext = createContext<<T>(promise: Promise<T>) => Promise<T>>(p => p)

export function GlobalLoadingiState({children}) {
  const [loading, setLoading] = useState(false)
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

  return <>
    <StartLoadingContext.Provider value={startLoading}>
      {children}
    </StartLoadingContext.Provider>
    <GlobalSpinner loading={loading}/>
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
  if (loading) {
    return <Spinner size={100} /> //<NonIdealState icon={<Spinner />} />;
  }
  if (error) {
    return <NonIdealState icon="error"
      title="Tietojen lataaminen epäonnistui"
      description={error.message}
      action={<Button text="Yritä uudelleen" onClick={() => refetch()} intent="primary" />}
    />
  }
  return null
}
