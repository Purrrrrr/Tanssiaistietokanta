import { useEffect, useState } from 'react'
import { ApolloProvider } from '@apollo/client'

import { apolloClient } from './apollo'
import AppLoadingSpinner from './AppLoadingSpinner'
import { initializeAuthentication } from './authentication'

export const BackendProvider = ({ children }) => {
  const [initialized, setInitialized] = useState(false)
  useEffect(() => {
    initializeAuthentication().then(() => setInitialized(true))
  }, [])

  return <ApolloProvider client={apolloClient}>
    <AppLoadingSpinner appInitialized={initialized}>
      {initialized && children}
    </AppLoadingSpinner>
  </ApolloProvider>
}
