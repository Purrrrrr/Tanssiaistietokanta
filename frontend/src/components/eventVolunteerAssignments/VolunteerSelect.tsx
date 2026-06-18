import { EventVolunteerAssignment, ID } from 'types'

import { useShowGlobalLoadingAnimation } from 'backend'
import { useEventVolunteers } from 'services/eventVolunteers'

import { AutocompleteInput } from 'libraries/formsV2/components/inputs/selectors'
import { Person } from 'libraries/ui/icons'
import { useT } from 'i18n'
import { sortedBy } from 'utils/sorted'

interface VolunteerSelectorProps {
  className?: string
  id: string
  currentAssignments: Pick<EventVolunteerAssignment, 'volunteer' | 'role' | 'workshop'>[]
  eventId: ID
  roleId?: ID
  workshopId?: ID
  onChange: (newVolunteer: VolunteerOption) => void
}

export function VolunteerSelect({ id, currentAssignments, eventId, roleId, workshopId, onChange, className }: VolunteerSelectorProps) {
  const t = useT('components.volunteerAssignmentEditor')
  const [eventVolunteers = [], requestState] = useEventVolunteers({ eventId })

  useShowGlobalLoadingAnimation(requestState.loading)

  const matchingAssignments = currentAssignments.filter(a =>
    (!roleId || a.role._id === roleId)
    && (!workshopId || a.workshop?._id === workshopId),
  )
  const assignedIds = new Set(matchingAssignments.map(a => a.volunteer._id))
  const eventVolunteerOptions: VolunteerOption[] = eventVolunteers
    .filter(v =>
      (!roleId || v.interestedIn.length === 0 || v.interestedIn.find(r => r._id === roleId))
      && v.status === 'Accepted',
    )
    .map(ev => ev.volunteer)
    .filter(v => !assignedIds.has(v._id))

  return <>
    <AutocompleteInput<VolunteerOption>
      id={id}
      containerClassname={className}
      value={null}
      onChange={onChange}
      items={sortedBy(eventVolunteerOptions, 'name')}
      itemToString={v => v.name}
      itemIcon={() => <Person className="text-blue-300" />}
      placeholder={t('addVolunteer')}
      noResultsText={t('noVolunteers')}
    />
    {requestState.error && <div className="text-red-500">{requestState.error.message}</div>}
  </>
}

export interface VolunteerOption { _id: string, name: string }
