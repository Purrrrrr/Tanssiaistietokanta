import { createFileRoute, redirect } from '@tanstack/react-router'

import { Breadcrumb } from 'libraries/ui'
import { EventProgramEditor } from 'components/event/EventProgramEditor'
import { PageTitle } from 'components/PageTitle'
import { RequirePermissions } from 'components/rights/RequirePermissions'
import { useT, useTranslation } from 'i18n'

import { useCurrentEvent } from './-context'

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/program/{-$tabId}/{-$slideId}',
)({
  component: RouteComponent,
  loader: ({ params }) => {
    if (!params.tabId) {
      throw redirect({
        to: Route.fullPath,
        params: { ...params, tabId: 'main' },
      })
    }
  },
})

function RouteComponent() {
  const event = useCurrentEvent()
  const t = useT('pages.events.eventProgramPage')
  return <>
    <Breadcrumb to={Route.to} from={Route.fullPath} params={{}} text={useTranslation('breadcrumbs.eventProgram')} />
    <PageTitle noRender>{t('pageTitle')}</PageTitle>
    <RequirePermissions requireRight="events:read,modify" fallback="loginPage" entityId={event._id}>
      <EventProgramEditor event={event} />
    </RequirePermissions>
  </>
}
