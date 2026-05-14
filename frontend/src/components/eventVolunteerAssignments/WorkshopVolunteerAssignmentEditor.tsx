import { Event, EventVolunteerAssignment, ID } from 'types'

import { useShowGlobalLoadingAnimation } from 'backend'
import { useCreateEventVolunteerAssignment, useEventVolunteerAssignments } from 'services/eventVolunteerAssignments'
import { useEventVolunteers } from 'services/eventVolunteers'

import { AutocompleteInput } from 'libraries/formsV2/components/inputs/selectors'
import { useT } from 'i18n'
import { sortedBy } from 'utils/sorted'

import { VolunteerAssignmentList } from './VolunteerAssignmentList'

export interface WorkshopVolunteerAssignmentEditorProps {
  id: string
  title: string
  event: Pick<Event, '_id' | '_versionId' | 'eventRegistrationSystem'>
  roleId: ID
  workshopId: ID
  workshopVersionId?: ID
  workshopInstances?: { _id: ID, abbreviation?: string | null }[]
}

export function WorkshopVolunteerAssignmentEditor({ title, id, event, roleId, workshopId, workshopVersionId, workshopInstances }: WorkshopVolunteerAssignmentEditorProps) {
  const { _id: eventId, _versionId: eventVersionId } = event
  const [currentAssignments = [], requestState] = useEventVolunteerAssignments({ eventId, eventVersionId, roleId, workshopId, workshopVersionId })

  useShowGlobalLoadingAnimation(requestState.loading)
  const readOnly = eventVersionId != null || workshopVersionId != null

  return <VolunteerAssignmentList
    showName
    assignments={currentAssignments}
    title={title}
    readOnly={readOnly}
    event={event}
    workshopInstances={workshopInstances}
  >
    {!readOnly &&
      <AddVolunteerSelect
        id={id}
        currentAssignments={currentAssignments}
        eventId={eventId}
        roleId={roleId}
        workshopId={workshopId}
      />
    }
    {requestState.error && <div className="text-red-500">{requestState.error.message}</div>}
  </VolunteerAssignmentList>
}

interface VolunteerSelectorProps {
  id: string
  currentAssignments: EventVolunteerAssignment[]
  eventId: ID
  roleId: ID
  workshopId?: ID
}

function AddVolunteerSelect({ id, currentAssignments, eventId, roleId, workshopId }: VolunteerSelectorProps) {
  const t = useT('components.volunteerAssignmentEditor')
  const [eventVolunteers = [], requestState] = useEventVolunteers({ eventId })
  const [createAssignment] = useCreateEventVolunteerAssignment()

  useShowGlobalLoadingAnimation(requestState.loading)

  const assignedIds = new Set(currentAssignments.map(a => a.volunteer._id))
  const eventVolunteerOptions: VolunteerOption[] = eventVolunteers
    .filter(v => v.interestedIn.find(r => r._id === roleId) && v.status === 'Accepted')
    .map(ev => ev.volunteer)
    .filter(v => !assignedIds.has(v._id))

  const getItems = (query: string) => {
    const q = query.trim().toLowerCase()
    const matches = (v: VolunteerOption) => !q || v.name.toLowerCase().includes(q)
    return sortedBy(eventVolunteerOptions.filter(matches), 'name')
  }

  const onChange = async (newVolunteer: VolunteerOption) => {
    await createAssignment({
      eventVolunteerAssignment: { eventId, roleId, volunteerId: newVolunteer._id, workshopId, registrationStatus: 'None' },
    })
  }

  return <>
    <AutocompleteInput<VolunteerOption>
      id={id}
      containerClassname="mb-6"
      value={null}
      onChange={onChange}
      items={getItems}
      itemToString={v => v.name}
      placeholder={t('addVolunteer')}
      noResultsText={t('noVolunteers')}
    />
    {requestState.error && <div className="text-red-500">{requestState.error.message}</div>}
  </>
}

interface VolunteerOption { _id: string, name: string }
