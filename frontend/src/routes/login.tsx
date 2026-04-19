import { createFileRoute } from '@tanstack/react-router'

import { Page } from 'components/Page'
import LoginForm from 'components/rights/LoginForm'
import { useTranslation } from 'i18n'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
  validateSearch: (search): { redirectTo?: string } => {
    return {
      redirectTo: typeof search.redirectTo === 'string' ? decodeURIComponent(search.redirectTo) : undefined,
    }
  },
})

function RouteComponent() {
  return <Page title={useTranslation('components.loginForm.login')}>
    <LoginForm defaultRedirectTo="/" />
  </Page>
}
