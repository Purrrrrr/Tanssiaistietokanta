import { createFileRoute } from '@tanstack/react-router'

import LoginForm from 'components/rights/LoginForm'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
  validateSearch: (search): { redirectTo?: string } => {
    return {
      redirectTo: typeof search.redirectTo === 'string' ? decodeURIComponent(search.redirectTo) : undefined,
    }
  },
})

function RouteComponent() {
  return <LoginForm defaultRedirectTo="/" />
}
