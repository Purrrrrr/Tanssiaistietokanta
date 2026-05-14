import { createFileRoute } from '@tanstack/react-router'

import { VolunteerAssignmentEditor } from 'components/eventVolunteerAssignments/VolunteerAssignmentEditor'
import { useT } from 'i18n'

import { useCurrentEvent } from '../-context'

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/assignments/',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const event = useCurrentEvent()
  const t = useT('routes.events.event.assignments')
  return <VolunteerAssignmentEditor
    id="eventAssignments"
    event={event}
    title={t(event.eventRegistrationSystem === 'Kompassi' ? 'assignmentsAndRegistrationStatus' : 'assignments')}
  />
}
