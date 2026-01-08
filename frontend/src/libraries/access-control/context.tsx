import { createContext, useContext } from 'react'

import { RightQuery } from './types'

export type RightsProviderFunction<User> = (
  user: User | null,
  query: RightQuery,
) => boolean
export type RightsQueryFunction = (right: RightQuery) => boolean

interface RightsQueryContextType<User = unknown> {
  user: User | null
  hasRight: RightsProviderFunction<User>
}

const RightsQueryContext = createContext<RightsQueryContextType>({
  user: null,
  hasRight: () => false,
})

export function AccessControlProvider<User>({
  user,
  hasRight,
  children,
}: RightsQueryContextType<User> & { children: React.ReactNode }) {
  return (
    <RightsQueryContext.Provider value={{ user, hasRight } as RightsQueryContextType}>
      {children}
    </RightsQueryContext.Provider>
  )
}

export function useRightsQueryFn(): RightsQueryFunction {
  const { user, hasRight } = useContext(RightsQueryContext)
  return hasRight.bind(null, user)
}
