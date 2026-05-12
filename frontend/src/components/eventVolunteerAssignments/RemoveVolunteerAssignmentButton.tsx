import { EventVolunteerAssignment } from 'types'

import { useDeleteEventVolunteerAssignment } from 'services/eventVolunteerAssignments'

import { ButtonProps } from 'libraries/ui'
import { DeleteButton } from 'components/widgets/DeleteButton'
import { useT } from 'i18n'

export function RemoveAssignmentsButton({ assignments, confirmationType, ...rest }: Omit<ButtonProps, 'text'> & {
  confirmationType: 'name' | 'role'
  iconOnly?: boolean
  text: string
  assignments: EventVolunteerAssignment[]
}) {
  const [deleteAssignment] = useDeleteEventVolunteerAssignment()
  const t = useT('components.volunteerAssignmentEditor')
  const disabled = !assignments.every(canDeleteEventVolunteerAssignment)
  const count = assignments.length
  const getName = confirmationType === 'name'
    ? (a: EventVolunteerAssignment) => a.volunteer.name
    : (a: EventVolunteerAssignment) => a.role.name
  const name = assignments.map(getName).join(', ')

  return <DeleteButton
    minimal
    {...rest}
    disabled={disabled}
    tooltip={disabled && t('cannotRemoveRegisteredAssignment')}
    onDelete={() => Promise.all([
      assignments.map(assignment => deleteAssignment({ id: assignment._id })),
    ])}
    confirmTitle={t(
      confirmationType === 'name' ? 'removeVolunteersConfirmation.title' : 'removeRolesConfirmation.title',
      { count },
    )}
    confirmText={t(
      confirmationType === 'name' ? 'removeVolunteersConfirmation.text' : 'removeRolesConfirmation.text',
      { name, count },
    )}
  />
}

const canDeleteEventVolunteerAssignment = (assignment: Pick<EventVolunteerAssignment, 'registrationStatus'>) =>
  assignment.registrationStatus === 'None'
