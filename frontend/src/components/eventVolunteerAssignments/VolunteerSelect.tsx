import { EventVolunteerAssignment, ID } from 'types'

import { useShowGlobalLoadingAnimation } from 'backend'
import { useEventVolunteers } from 'services/eventVolunteers'

import { AutocompleteInput } from 'libraries/formsV2/components/inputs/selectors'
import { useT } from 'i18n'
import { sortedBy } from 'utils/sorted'

interface VolunteerSelectorProps {
  className?: string
  id: string
  currentAssignments: EventVolunteerAssignment[]
  eventId: ID
  roleId?: ID
  workshopId?: ID
  onChange: (newVolunteer: VolunteerOption) => void
}

export function VolunteerSelect({ id, currentAssignments, eventId, roleId, onChange, className }: VolunteerSelectorProps) {
  const t = useT('components.volunteerAssignmentEditor')
  const [eventVolunteers = [], requestState] = useEventVolunteers({ eventId })

  useShowGlobalLoadingAnimation(requestState.loading)

  const assignedIds = new Set(currentAssignments.map(a => a.volunteer._id))
  const eventVolunteerOptions: VolunteerOption[] = eventVolunteers
    .filter(v =>
      (!roleId || v.interestedIn.find(r => r._id === roleId))
      && v.status === 'Accepted',
    )
    .map(ev => ev.volunteer)
    .filter(v => !assignedIds.has(v._id))

  const getItems = (query: string) => {
    const q = query.trim().toLowerCase()
    const matches = (v: VolunteerOption) => !q || v.name.toLowerCase().includes(q)
    return sortedBy(eventVolunteerOptions.filter(matches), 'name')
  }

  return <>
    <AutocompleteInput<VolunteerOption>
      id={id}
      containerClassname={className}
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
