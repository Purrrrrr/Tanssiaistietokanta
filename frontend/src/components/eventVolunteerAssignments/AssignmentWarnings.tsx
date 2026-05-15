import { Event, EventRegistrationSystem, ID } from 'types'

import { useEventVolunteerAssignments } from 'services/eventVolunteerAssignments'
import { useEventVolunteers } from 'services/eventVolunteers'

import { Callout, CounterTag } from 'libraries/ui'
import { useT } from 'i18n'

export function AssignmentWarningsCounterTag({ event }: { event: Pick<Event, '_id' | 'eventRegistrationSystem'> }) {
  const t = useT('components.assignmentsWarnings')
  const {
    warningCount,
    volunteersWithoutAssignment,
    nonRegisteredAssignments,
    nonAcceptedAssignments,
    unreportedCancellations,
  } = useEventAssignmentWarnings(event._id, event.eventRegistrationSystem)
  if (warningCount === 0) {
    return null
  }

  const title = [
    volunteersWithoutAssignment.length > 0 && t('volunteersWithoutAssignments', { count: volunteersWithoutAssignment.length }),
    nonRegisteredAssignments.length > 0 && t('nonRegisteredAssignments', { count: nonRegisteredAssignments.length }),
    nonAcceptedAssignments.length > 0 && t('nonAcceptedAssignments', { count: nonAcceptedAssignments.length }),
    unreportedCancellations.length > 0 && t('cancelledAssignments', { count: unreportedCancellations.length }),
  ].filter(Boolean).join('\n')

  return <CounterTag count={warningCount} title={title} color="danger" />
}

export function AssignmentWarnings({ event }: { event: Pick<Event, '_id' | 'eventRegistrationSystem'> }) {
  const t = useT('components.assignmentsWarnings')
  const {
    volunteersWithoutAssignment,
    nonRegisteredAssignments,
    nonAcceptedAssignments,
    unreportedCancellations,
  } = useEventAssignmentWarnings(event._id, event.eventRegistrationSystem)

  return <>
    {volunteersWithoutAssignment.length > 0 &&
      <Callout color="warning" title={t('volunteersWithoutAssignments', { count: volunteersWithoutAssignment.length })} />}
    {nonRegisteredAssignments.length > 0 &&
      <Callout color="warning" title={t('nonRegisteredAssignments', { count: nonRegisteredAssignments.length })} />}
    {nonAcceptedAssignments.length > 0 &&
      <Callout color="warning" title={t('nonAcceptedAssignments', { count: nonAcceptedAssignments.length })} />}
    {unreportedCancellations.length > 0 &&
      <Callout color="warning" title={t('cancelledAssignments', { count: unreportedCancellations.length })} />}
  </>
}

export function useEventAssignmentWarnings(eventId: ID, eventRegistrationSystem: EventRegistrationSystem) {
  const [volunteers = []] = useEventVolunteers({ eventId })
  const [assignments = []] = useEventVolunteerAssignments({ eventId })

  const volunteersWithoutAssignment = volunteers.filter(v => v.status === 'Accepted' && !assignments.some(a => a.volunteer._id === v.volunteerId))
  const nonRegisteredAssignments = eventRegistrationSystem === 'Kompassi'
    ? assignments.filter(a => a.registrationStatus === 'None')
    : []
  const nonAcceptedAssignments = eventRegistrationSystem === 'Kompassi'
    ? assignments.filter(a => a.registrationStatus === 'RegisteredToEventSystem')
    : []
  const cancelledVolunteers = volunteers.filter(v => v.status === 'Cancelled')
  const unreportedCancellations = eventRegistrationSystem === 'Kompassi'
    ? assignments.filter(a => cancelledVolunteers.some(c => c.volunteerId === a.volunteer._id) && a.registrationStatus !== 'RegistrationCancelled')
    : []

  return {
    volunteersWithoutAssignment,
    nonRegisteredAssignments,
    nonAcceptedAssignments,
    unreportedCancellations,
    warningCount: volunteersWithoutAssignment.length + nonRegisteredAssignments.length + nonAcceptedAssignments.length + unreportedCancellations.length,
  }
}
