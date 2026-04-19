import { ErrorComponent as DefaultErrorComponent, ErrorComponentProps } from '@tanstack/react-router'
import { useApolloClient } from '@apollo/client'

import { RightsQuery } from 'libraries/access-control/types'

import { ApolloClient, useShowGlobalLoadingAnimation } from 'backend'
import { apolloClient } from 'backend/apollo'

import { useHasRights } from 'libraries/access-control'
import { Button } from 'libraries/ui'
import NavigationLayout from 'components/NavigationLayout'
import { Page } from 'components/Page'
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

export function LoadingComponent() {
  useShowGlobalLoadingAnimation(true)
  return null
}

export function ErrorComponent(props: ErrorComponentProps) {
  const { error, reset } = props
  const t = useT('')
  if (error instanceof AccessDeniedError) {
    return <NavigationLayout>
      <Page title={t('components.loginForm.login')}>
        <LoginForm onSuccess={reset} />
      </Page>
    </NavigationLayout>
  }
  return <NavigationLayout>
    <DefaultErrorComponent {...props} />
    <Button onClick={reset}>Try again</Button>
  </NavigationLayout>
}

export class AccessDeniedError extends Error {}
