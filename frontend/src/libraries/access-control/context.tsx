import { createContext, useContext } from 'react'

import { RightQuery, ServiceName } from './types'

export type RightsProviderFunction = (
  query: RightQuery<ServiceName>,
) => Promise<boolean>
export type HasCachedRightFunction = (
  query: RightQuery<ServiceName>,
) => boolean | undefined
export type RightsQueryFunction = (right: RightQuery<ServiceName>) => Promise<boolean>

interface RightsQueryContextType {
  subscribe: (callback: () => void) => () => void
  hasRight: RightsProviderFunction
  hasCachedRight: HasCachedRightFunction
}

const RightsQueryContext = createContext<RightsQueryContextType>({
  subscribe: () => () => {},
  hasRight: () => Promise.resolve(false),
  hasCachedRight: () => undefined,
})

const alwaysUnknown: HasCachedRightFunction = () => undefined

interface AccessControlProviderProps extends Omit<RightsQueryContextType, 'hasCachedRight'> {
  hasCachedRight?: HasCachedRightFunction
  children: React.ReactNode
}

export function AccessControlProvider({
  hasRight,
  hasCachedRight = alwaysUnknown,
  subscribe,
  children,
}: AccessControlProviderProps) {
  return (
    <RightsQueryContext.Provider value={{ hasRight, hasCachedRight, subscribe }}>
      {children}
    </RightsQueryContext.Provider>
  )
}

export function useRightsContext(): RightsQueryContextType {
  return useContext(RightsQueryContext)
}
