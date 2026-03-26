import { ErrorComponent as DefaultErrorComponent, ErrorComponentProps } from '@tanstack/react-router'
import { useApolloClient } from '@apollo/client'

import { RightsQuery } from 'libraries/access-control/types'

import { ApolloClient } from 'backend'

import { useHasRights } from 'libraries/access-control'
import { Button } from 'libraries/ui'
import LoginForm from 'components/rights/LoginForm'
import { Translator, useT } from 'i18n'

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
  queryClient: null as unknown as ApolloClient,
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

export function ErrorComponent(props: ErrorComponentProps) {
  const { error, reset } = props
  if (error instanceof AccessDeniedError) {
    return <LoginForm onSuccess={reset} />
  }
  return <div>
    <DefaultErrorComponent {...props} />
    <Button onClick={reset}>Try again</Button>
  </div>
}

export class AccessDeniedError extends Error {}
