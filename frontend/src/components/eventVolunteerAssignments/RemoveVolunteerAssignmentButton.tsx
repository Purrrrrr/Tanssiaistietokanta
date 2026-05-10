import { EventVolunteerAssignment } from 'types'

import { useDeleteEventVolunteerAssignment } from 'services/eventVolunteerAssignments'

import { ButtonProps } from 'libraries/ui'
import { DeleteButton } from 'components/widgets/DeleteButton'
import { useT } from 'i18n'

export function RemoveAssignmentsButton({ assignments, ...rest }: Omit<ButtonProps, 'text'> & {
  iconOnly?: boolean
  text: string
  assignments: EventVolunteerAssignment[]
}) {
  const [deleteAssignment] = useDeleteEventVolunteerAssignment()
  const t = useT('components.volunteerAssignmentEditor')
  const disabled = !assignments.every(canDeleteEventVolunteerAssignment)
  const count = assignments.length
  const name = assignments.map(a => a.volunteer.name).join(', ')

  return <DeleteButton
    minimal
    {...rest}
    disabled={disabled}
    tooltip={disabled && t('cannotRemoveRegisteredAssignment')}
    onDelete={() => Promise.all([
      assignments.map(assignment => deleteAssignment({ id: assignment._id })),
    ])}
    confirmTitle={t('removeVolunteersConfirmation.title', { count })}
    confirmText={t('removeVolunteersConfirmation.text', { name, count })}
  />
}

const canDeleteEventVolunteerAssignment = (assignment: Pick<EventVolunteerAssignment, 'registrationStatus'>) =>
  assignment.registrationStatus === 'None'
