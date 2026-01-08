import { hasRight, useCurrentUser } from 'services/users'

import { AccessControlProvider } from 'libraries/access-control'

export function RightsContext({ children }: { children: React.ReactNode }) {
  const user = useCurrentUser()
  return <AccessControlProvider user={user} hasRight={hasRight}>
    {children}
  </AccessControlProvider>
}
