import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import NavigationLayout from 'components/NavigationLayout'
import { PageTitle } from 'components/PageTitle'

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => <NavigationLayout>
    <div className="flex flex-col items-center gap-4">
      <img alt="404" src="/404.png" />
      <PageTitle>Page not found</PageTitle>
    </div>
  </NavigationLayout>,
})

function RootComponent() {
  return (
    <NavigationLayout>
      <Outlet />
      <TanStackRouterDevtools />
    </NavigationLayout>
  )
}
