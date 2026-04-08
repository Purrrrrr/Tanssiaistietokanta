import { Volunteer } from 'types'

import { addGlobalLoadingAnimation } from 'backend'
import { useDeleteVolunteer } from 'services/volunteers'

import { DeleteButton } from 'components/widgets/DeleteButton'
import { useT } from 'i18n'

interface DeleteVolunteerButtonProps {
  minimal?: boolean
  volunteer: Volunteer
}

export function DeleteVolunteerButton({ minimal, volunteer }: DeleteVolunteerButtonProps) {
  const t = useT('routes.volunteers')
  const [deleteVolunteer] = useDeleteVolunteer({ refetchQueries: ['getVolunteers'] })

  const handleDelete = () => {
    addGlobalLoadingAnimation(deleteVolunteer({ id: volunteer._id }))
  }

  return <DeleteButton
    requireRight="volunteers:delete"
    entityId={volunteer._id}
    minimal={minimal}
    disabled={volunteer.volunteeredIn.length > 0}
    onDelete={handleDelete}
    iconOnly={minimal}
    text={t('deleteVolunteer')}
    tooltip={t('deleteVolunteer')}
    confirmText={t('deleteConfirmation')}
  />
}
