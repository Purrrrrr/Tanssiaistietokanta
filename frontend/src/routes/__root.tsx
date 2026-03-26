import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { RightsQuery } from 'libraries/access-control/types'

import { Breadcrumb } from 'libraries/ui'
import NavigationLayout from 'components/NavigationLayout'
import { PageTitle } from 'components/PageTitle'
import { T, TranslationKey } from 'i18n'
import { type DanceOrganizerRootRouteContext } from 'utils/routeUtils'

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    requireRights?: RouteRequireRights
    usesRights?: RouteRequireRights
    breadcrumb?: TranslationKey | (() => React.ReactNode)
  }
}

type RouteRequireRights = RightsQuery['rights'] | RightsQuery | ((params: Params) => RightsQuery)
// Apparently it's not possible to infer these types directly from router definitions
// without causing circular dependencies, so we have to define them manually here
interface Params {
  danceId?: string
  eventId?: string
}

export const Route = createRootRouteWithContext<DanceOrganizerRootRouteContext>()({
  component: RootComponent,
  beforeLoad: async ({ matches, context }) => {
    const requiredRights = matches
      .map(({ staticData: { requireRights }, params }) => toRightsQuery(requireRights, params))
      .filter(r => r !== undefined)
    const usedRights = matches
      .map(({ staticData: { usesRights }, params }) => toRightsQuery(usesRights, params))
      .filter(r => r !== undefined)
    await Promise.all([
      ...requiredRights.map(context.requireAccess),
      ...usedRights.map(context.hasAccess),
    ])
  },
  notFoundComponent: () =>
    <div className="flex flex-col items-center gap-4">
      <img alt="404" src="/404.png" />
      <PageTitle>Page not found</PageTitle>
    </div>,
  staticData: {
    breadcrumb: () => <Breadcrumb to="/"><img className="mr-2" src="/fan32.png" alt="" /><T msg="app.title" /></Breadcrumb>,
    usesRights: ['dances:list'],
  },
})

function toRightsQuery(r: RouteRequireRights | undefined, params: Params): RightsQuery | undefined {
  if (typeof r === 'string' || Array.isArray(r)) {
    return { rights: r }
  }
  if (typeof r === 'function') {
    return r(params)
  }
  return r
}

function RootComponent() {
  return (
    <NavigationLayout>
      <Outlet />
      <TanStackRouterDevtools />
    </NavigationLayout>
  )
}
