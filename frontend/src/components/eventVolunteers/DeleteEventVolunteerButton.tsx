import { addGlobalLoadingAnimation } from 'backend'
import { useDeleteEventVolunteer } from 'services/eventVolunteers'

import { DeleteButton } from 'components/widgets/DeleteButton'
import { useT } from 'i18n'

interface DeleteEventVolunteerButtonProps {
  minimal?: boolean
  eventVolunteerId: string
}

export function DeleteEventVolunteerButton({ minimal, eventVolunteerId }: DeleteEventVolunteerButtonProps) {
  const t = useT('pages.events.volunteersPage')
  const [deleteEventVolunteer] = useDeleteEventVolunteer({ refetchQueries: ['getEventVolunteers'] })

  const handleDelete = () => {
    addGlobalLoadingAnimation(deleteEventVolunteer({ id: eventVolunteerId }))
  }

  return <DeleteButton
    requireRight="eventVolunteers:delete"
    entityId={eventVolunteerId}
    minimal={minimal}
    onDelete={handleDelete}
    iconOnly={minimal}
    text={t('deleteVolunteer')}
    tooltip={t('deleteVolunteer')}
    confirmText={t('deleteConfirmation')}
  />
}
