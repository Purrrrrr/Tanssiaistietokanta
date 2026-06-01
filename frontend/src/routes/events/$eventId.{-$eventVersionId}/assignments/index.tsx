import { createFileRoute } from '@tanstack/react-router'

import { VolunteerAssignmentEditor } from 'components/eventVolunteerAssignments/VolunteerAssignmentEditor'
import { AssignmentSearchTerm, parseSearch } from 'components/eventVolunteerAssignments/VolunteerAssignmentSearch'
import { useT } from 'i18n'

import { useCurrentEvent } from '../-context'

export const Route = createFileRoute(
  '/events/$eventId/{-$eventVersionId}/assignments/',
)({
  component: RouteComponent,
  validateSearch(search: Record<string, unknown>): { search?: AssignmentSearchTerm[] } {
    return {
      search: parseSearch(search.search),
    }
  },
})

function RouteComponent() {
  const event = useCurrentEvent()
  const t = useT('routes.events.event.assignments')
  const { search } = Route.useSearch()
  const navigate = Route.useNavigate()
  const setSearch = (newSearch: AssignmentSearchTerm[]) => {
    navigate({
      search: { search: newSearch },
    })
  }

  return <VolunteerAssignmentEditor
    id="eventAssignments"
    event={event}
    search={search}
    onSetSearch={setSearch}
    title={t(event.eventRegistrationSystem === 'Kompassi' ? 'assignmentsAndRegistrationStatus' : 'assignments')}
  />
}
