import { createFileRoute, Outlet } from '@tanstack/react-router'

import { useEvent } from 'services/events'

import { Breadcrumb } from 'libraries/ui'
import { LoadingState } from 'components/LoadingState'
import VersionableContentContainer from 'components/versioning/VersionableContentContainer'

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

function RouteComponent() {
  const { eventId, eventVersionId } = Route.useParams()
  const [event, loadingState] = useEvent(eventId, eventVersionId)

  return <VersionableContentContainer>
    {event
      ? <EventContext.Provider value={event}>
        <Outlet />
      </EventContext.Provider>
      : <LoadingState {...loadingState} />
    }
  </VersionableContentContainer>
}
