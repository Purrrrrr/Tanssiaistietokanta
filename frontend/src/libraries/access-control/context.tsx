import { createContext, useContext } from 'react'

import { RightQuery, ServiceName } from './types'

export type RightsProviderFunction = (
  query: RightQuery<ServiceName>,
) => Promise<boolean>
export type RightsQueryFunction = (right: RightQuery<ServiceName>) => Promise<boolean>

interface RightsQueryContextType {
  subscribe: (callback: () => void) => () => void
  hasRight: RightsProviderFunction
}

const RightsQueryContext = createContext<RightsQueryContextType>({
  subscribe: () => () => {},
  hasRight: () => Promise.resolve(false),
})

export function AccessControlProvider({
  hasRight,
  subscribe,
  children,
}: RightsQueryContextType & { children: React.ReactNode }) {
  return (
    <RightsQueryContext.Provider value={{ hasRight, subscribe }}>
      {children}
    </RightsQueryContext.Provider>
  )
}

export function useRightsContext(): RightsQueryContextType {
  return useContext(RightsQueryContext)
}
