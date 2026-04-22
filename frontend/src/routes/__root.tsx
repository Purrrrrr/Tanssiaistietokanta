import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

import { RightsQuery } from 'libraries/access-control/types'

import { useEvents } from 'services/events'

import { Breadcrumb, Link } from 'libraries/ui'
import { Home } from 'libraries/ui/icons'
import NavigationLayout from 'components/NavigationLayout'
import { MenuLink, Page } from 'components/Page'
import { T, TranslationKey, useT } from 'i18n'
import { type DanceOrganizerRootRouteContext, ErrorComponent } from 'utils/routeUtils'

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    requireRights?: RouteRequireRights
    usesRights?: RouteRequireRights
    breadcrumb?: TranslationKey | (() => React.ReactNode)
    breadcrumbMenu?: () => React.ReactNode
  }
}

type RouteRequireRights = RightsQuery['rights'] | RightsQuery | ((params: Params) => RightsQuery)
// Apparently it's not possible to infer these types directly from router definitions
// without causing circular dependencies, so we have to define them manually here
interface Params {
  danceId?: string
  eventId?: string
  eventVersionId?: string
  documentId?: string
  workshopId?: string
}

export const Route = createRootRouteWithContext<DanceOrganizerRootRouteContext>()({
  component: RootComponent,
  errorComponent: ErrorComponent,
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
  notFoundComponent: NotFound,
  staticData: {
    breadcrumb: () => (
      <Breadcrumb to="/" menu={<Menu />}>
        <Home /><span className="sr-only"><T msg="app.title" /></span>
      </Breadcrumb>
    ),
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

function NotFound() {
  const t = useT('routes.notFound')
  return <Page
    title={t('pageNotFound')}
    logo={
      <div className="rounded-2xl bg-amber-100/65 backdrop-blur-md">
        <img alt="404" src="/404.png?v=2" className="h-36" />
      </div>
    }>
    <Link to="/">{t('returnToHome')}</Link>
  </Page>
}

function Menu() {
  const [events] = useEvents()

  return <>
    <MenuLink to="/dances" text={<><span className="mr-0.5">💃</span><T msg="navigation.dances" /></>} />
    {events.map(event =>
      <MenuLink key={event._id} to="/events/$eventId/{-$eventVersionId}" params={{ eventId: event._id }} text={event.name} />,
    )}
  </>
}
