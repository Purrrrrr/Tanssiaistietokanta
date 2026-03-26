import { subscribeToAccessUpdates } from 'services/access'
import { hasCachedRight, hasRight } from 'services/users'

import { AccessControlProvider } from 'libraries/access-control'

export function RightsContext({ children }: { children: React.ReactNode }) {
  return <AccessControlProvider hasRight={hasRight} hasCachedRight={hasCachedRight} subscribe={subscribeToAccessUpdates}>
    {children}
  </AccessControlProvider>
}
