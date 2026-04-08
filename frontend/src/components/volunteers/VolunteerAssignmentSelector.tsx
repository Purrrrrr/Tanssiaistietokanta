import { ID } from 'types'

import { useCreateEventVolunteerAssignment, useDeleteEventVolunteerAssignment, useEventVolunteerAssignments } from 'services/eventVolunteerAssignments'
import { useEventVolunteers } from 'services/eventVolunteers'
import { useVolunteerNames } from 'services/volunteers'

import { AutocompleteMultipleInput } from 'libraries/formsV2/components/inputs/selectors'
import { useT } from 'i18n'

interface VolunteerOption { _id: string, name: string }

export interface VolunteerAssignmentSelectorProps {
  id: string
  eventId: ID
  eventVersionId?: ID
  roleId: ID
  workshopId?: ID
  workshopVersionId?: ID
}

export function VolunteerAssignmentSelector({ id, eventId, eventVersionId, roleId, workshopId, workshopVersionId }: VolunteerAssignmentSelectorProps) {
  const t = useT('components.volunteerAssignmentSelector')
  const [currentAssignments = []] = useEventVolunteerAssignments({ eventId, eventVersionId, roleId, workshopId, workshopVersionId })
  const [eventVolunteers = []] = useEventVolunteers({ eventId })
  const [allVolunteers = []] = useVolunteerNames()
  const [createAssignment] = useCreateEventVolunteerAssignment()
  const [deleteAssignment] = useDeleteEventVolunteerAssignment()

  const assignedIds = new Set(currentAssignments.map(a => a.volunteer._id))
  const eventVolunteerIds = new Set(eventVolunteers.map(ev => ev.volunteer._id))

  const eventVolunteerOptions: VolunteerOption[] = eventVolunteers
    .filter(v => v.interestedIn.find(r => r._id === roleId))
    .map(ev => ev.volunteer)
    .filter(v => !assignedIds.has(v._id))

  const otherVolunteerOptions: VolunteerOption[] = allVolunteers
    .filter(v => !assignedIds.has(v._id) && !eventVolunteerIds.has(v._id))

  const getItems = (query: string) => {
    const q = query.trim().toLowerCase()
    const matches = (v: VolunteerOption) => !q || v.name.toLowerCase().includes(q)
    return {
      categories: [
        { title: t('eventVolunteers'), items: eventVolunteerOptions.filter(matches) },
        { title: t('allVolunteers'), items: otherVolunteerOptions.filter(matches) },
      ],
    }
  }

  const value: VolunteerOption[] = currentAssignments.map(a => a.volunteer)

  const onChange = async (newVolunteers: VolunteerOption[]) => {
    const newIds = new Set(newVolunteers.map(v => v._id))

    await Promise.all([
      ...newVolunteers
        .filter(v => !assignedIds.has(v._id))
        .map(v => createAssignment({
          eventVolunteerAssignment: { eventId, roleId, volunteerId: v._id, workshopId },
        })),
      ...currentAssignments
        .filter(a => !newIds.has(a.volunteer._id))
        .map(a => deleteAssignment({ id: a._id })),
    ])
  }
  const readOnly = eventVersionId != null || workshopVersionId != null

  return <AutocompleteMultipleInput<VolunteerOption>
    id={id}
    value={value}
    onChange={onChange}
    readOnly={readOnly}
    items={getItems}
    itemToString={v => v.name}
    placeholder={readOnly ? '' : t('addVolunteer')}
    noResultsText={t('noVolunteers')}
  />
}
