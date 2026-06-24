import { useApolloClient } from '@apollo/client'

import { RightsQuery } from 'libraries/access-control/types'

import { apolloClient } from 'backend/apollo'

import { useHasRights } from 'libraries/access-control'
import { Translator, useT } from 'i18n'

type ApolloClient = typeof apolloClient

export interface DanceOrganizerRootRouteContext {
  hasAccess: (query: RightsQuery) => Promise<boolean[]>
  requireAccess: (query: RightsQuery) => Promise<void>
  T: Translator<''>
  queryClient: ApolloClient
}

export const defaultContext: DanceOrganizerRootRouteContext = {
  hasAccess: async () => [false],
  requireAccess: async () => {},
  T: () => '',
  queryClient: apolloClient,
}

export function useAppRootContext(): DanceOrganizerRootRouteContext {
  const hasAccess = useHasRights()
  const requireAccess = async (query: RightsQuery) => {
    const access = await hasAccess(query)
    if (!access.every(Boolean)) {
      throw new AccessDeniedError('Access denied')
    }
  }
  const T = useT('')
  const queryClient = useApolloClient() as ApolloClient

  return {
    hasAccess,
    requireAccess,
    T,
    queryClient,
  }
}

export function navigationHidden() {
  const isPrintPage = window.location.pathname.match(/\/(ball-program|print)(\/|$)/)
  return isPrintPage
}

export class AccessDeniedError extends Error {}
