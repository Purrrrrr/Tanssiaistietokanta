import { createFileRoute, Outlet } from '@tanstack/react-router'

import { useEvent } from 'services/events'

import { useRight } from 'libraries/access-control'
import { useFormatDate } from 'libraries/i18n/dateTime'
import { Breadcrumb } from 'libraries/ui'
import { Cog, Presentation } from 'libraries/ui/icons'
import { MissingDanceInstructionsCounterTag } from 'components/event/EventProgramEditor/components'
import { EventMetadataContext } from 'components/event/EventProgramForm/eventMetadata'
import { LoadingState } from 'components/LoadingState'
import { MenuLink, MenuSection, Page, Toolbar } from 'components/Page'
import VersionableContentContainer from 'components/versioning/VersionableContentContainer'
import { VersionSidebarToggle } from 'components/versioning/VersionSidebarToggle'
import { NavigateButton } from 'components/widgets/NavigateButton'
import { useT } from 'i18n'

import { EventContext } from './-context'

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}',
)({
  component: RouteComponent,
  loader: async ({ params: { eventId, eventVersionId }, context: { queryClient } }) => {
    const { data } = await queryClient.query({
      query: useEvent.query,
      variables: { id: eventId, versionId: eventVersionId },
    })
    return { event: data.event }
  },
  staticData: {
    requireRights: ({ eventId }) => ({
      rights: 'events:read',
      entityId: eventId,
    }),
    usesRights: ({ eventId }) => ({
      rights: ['events:modify', 'events:delete', 'events:manage-access', 'workshops:create', 'workshops:modify', 'workshops:delete', 'files:list', 'files:read', 'files:create', 'files:modify', 'files:delete'],
      context: 'events',
      contextId: eventId,
    }),
    breadcrumb: RouteBreadcrumb,
  },
})

function RouteBreadcrumb() {
  const { eventId, eventVersionId } = Route.useParams()
  const event = Route.useLoaderData()?.event

  return <Breadcrumb
    to="/events/$eventId/{-$eventVersionId}"
    params={{ eventId, eventVersionId }}
    text={event?.name ?? '-'}
  />
}

const eventVersionLink = (id: string, versionId?: null | string) => versionId
  ? `/events/${id}/version/${versionId}`
  : `/events/${id}`

function RouteComponent() {
  const { eventId, eventVersionId } = Route.useParams()
  const [event, loadingState] = useEvent(eventId, eventVersionId)
  const formatDate = useFormatDate()
  const canEdit = useRight('events:modify', { entityId: eventId })
  const t = useT('pages.events.eventPage')
  const params = { eventId, eventVersionId }

  return <VersionableContentContainer>
    {event
      ? <EventContext.Provider value={event}>
        <Page
          title={event.name}
          info={`${formatDate(event.beginDate)} - ${formatDate(event.endDate)}`}
          showVersion={!!eventVersionId}
          versionNumber={event._versionNumber}
          toolbar={
            <Toolbar>
              <NavigateButton
                minimal
                to="/events/$eventId/{-$eventVersionId}/ball-program/{-$slideId}"
                params={params}
                target="_blank"
                text={t('menu.ball.openSlideShow')}
                icon={<Presentation />}
              />
              <VersionSidebarToggle entityType="event" entityId={event._id} versionId={event._versionId ?? undefined} toVersionLink={eventVersionLink} />
            </Toolbar>
          }
          menu={canEdit &&
          <>
            <MenuSection title={t('menu.title')}>
              <MenuLink to="/events/$eventId/{-$eventVersionId}" params={params} activeOptions={{ exact: true }} text={t('menu.basicInfo')} />
              <MenuLink to="/events/$eventId/{-$eventVersionId}/edit" params={params} text={t('menu.editBasicInfo')} icon={<Cog />} />
            </MenuSection>
            <MenuSection title={t('menu.ball.title')}>
              <MenuLink to="/events/$eventId/{-$eventVersionId}/program/main" params={params} text={t('menu.ball.ballProgram')} />
              <MenuLink to="/events/$eventId/{-$eventVersionId}/program/slides/{-$slideId}" params={params}>
                {t('menu.ball.editSlideShow')}
                <EventMetadataContext program={event.program} workshops={event.workshops}>
                  <MissingDanceInstructionsCounterTag />
                </EventMetadataContext>
              </MenuLink>
            </MenuSection>
            <MenuSection title={t('menu.print')}>
              <MenuLink
                to="/events/$eventId/{-$eventVersionId}/print/ball-dancelist"
                params={params}
                target="_blank"
                text={t('printBallDanceList')} />
              <MenuLink
                to="/events/$eventId/{-$eventVersionId}/print/dance-cheatlist"
                params={params}
                target="_blank"
                text={t('danceCheatlist')} />
              <MenuLink
                to="/events/$eventId/{-$eventVersionId}/print/dance-instructions"
                params={params}
                target="_blank"
                text={t('danceInstructions')} />
            </MenuSection>
          </>
          }
        >
          <Outlet />
        </Page>
      </EventContext.Provider>
      : <LoadingState {...loadingState} />
    }
  </VersionableContentContainer>
}
