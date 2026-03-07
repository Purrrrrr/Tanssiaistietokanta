import { subscribeToAccessUpdates } from 'services/access'
import { hasRight } from 'services/users'

import { AccessControlProvider } from 'libraries/access-control'

export function RightsContext({ children }: { children: React.ReactNode }) {
  return <AccessControlProvider hasRight={hasRight} subscribe={subscribeToAccessUpdates}>
    {children}
  </AccessControlProvider>
}
