import { useSyncExternalStore } from 'react'

import { useDelayedValue } from 'libraries/common/useDelayedValue'
import { GlobalSpinner } from 'libraries/ui'
import { useTranslation } from 'i18n'

import { isConnected, subscribeToConnected } from './connection'
import { useIsGlobalLoading } from './globalLoadingState'

const connectionProblemMessageTimeout = 10000

interface AppLoadingSpinnerProps {
  children: React.ReactNode
  appInitialized: boolean
}

export default function AppLoadingSpinner({ children, appInitialized }: AppLoadingSpinnerProps) {
  const connected = useSyncExternalStore(subscribeToConnected, isConnected)
  const loading = useIsGlobalLoading()
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
