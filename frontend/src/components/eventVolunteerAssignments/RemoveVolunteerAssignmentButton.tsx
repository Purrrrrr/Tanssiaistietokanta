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

  return <DeleteButton
    minimal
    {...rest}
    disabled={disabled}
    tooltip={disabled && t('cannotRemoveRegisteredAssignment')}
    onDelete={() => Promise.all([
      assignments.map(assignment => deleteAssignment({ id: assignment._id })),
    ])}
    confirmTitle={t('removeAssignmentsConfirmation.title', { count })}
    confirmText={<>
      <p>{t('removeAssignmentsConfirmation.text', { count })}</p>
      <ul className={count > 1 ? 'list-disc list-inside' : undefined}>
        {assignments.map(a =>
          <li key={a._id}>
            {a.volunteer.name}, <span className="italic">{a.role.name.toLowerCase()} {a.workshop && `(${a.workshop.name})`}</span>
          </li>,
        )}
      </ul>
    </>}
  />
}

const canDeleteEventVolunteerAssignment = (assignment: Pick<EventVolunteerAssignment, 'registrationStatus'>) =>
  assignment.registrationStatus === 'None'
