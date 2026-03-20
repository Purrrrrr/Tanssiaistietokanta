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
})

function RouteComponent() {
  const { eventId, eventVersionId } = Route.useParams()
  const [event, loadingState] = useEvent(eventId, eventVersionId)

  return <VersionableContentContainer>
    {event
      ? <EventContext.Provider value={event}>
        <Breadcrumb to="/events/$eventId/{-$eventVersionId}" params={{ eventId, eventVersionId }} text={event.name} />
        <Outlet />
      </EventContext.Provider>
      : <LoadingState {...loadingState} />
    }
  </VersionableContentContainer>
}
