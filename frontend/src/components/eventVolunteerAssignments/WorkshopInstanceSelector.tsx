import { EventVolunteerAssignment, ID } from 'types'

import { workshopInstanceName } from 'services/workshops'

import { ModeButton, ModeSelector } from 'libraries/ui/ModeSelector'
import { useT } from 'i18n'

export function WorkshopInstanceSelector({ workshopInstances, readOnly, assignment, setInstanceIds, className }: {
  workshopInstances: {
    _id: ID
    abbreviation?: string | null
  }[]
  readOnly?: boolean
  assignment: EventVolunteerAssignment
  setInstanceIds: (assignment: EventVolunteerAssignment, instanceIds: ID[] | null) => void
  className?: string
}) {
  const disabled = readOnly === true
    || assignment.registrationStatus === 'RegisteredToEventSystem'
    || assignment.registrationStatus === 'AcceptedRegistration'
  const t = useT('components.volunteerAssignmentEditor')
  return workshopInstances && workshopInstances.length > 1 && <ModeSelector className={className}>
    <ModeButton
      disabled={disabled}
      selected={assignment.workshopInstanceIds == null}
      onClick={() => setInstanceIds(assignment, null)}
    >
      {t('allInstances')}
    </ModeButton>
    {workshopInstances.map((instance, index) => {
      const selected = assignment.workshopInstanceIds?.includes(instance._id) ?? false
      return (
        <ModeButton
          key={instance._id}
          disabled={disabled}
          selected={selected}
          onClick={() => setInstanceIds(
            assignment,
            selected
              ? assignment.workshopInstanceIds?.filter(id => id !== instance._id) ?? null
              : [...(assignment.workshopInstanceIds ?? []), instance._id],
          )}
        >
          {workshopInstanceName(index, instance)}
        </ModeButton>
      )
    })}
  </ModeSelector>
}
