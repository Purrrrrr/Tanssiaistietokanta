import { EventVolunteer } from 'types'

import { addGlobalLoadingAnimation } from 'backend'
import { useDeleteEventVolunteer } from 'services/eventVolunteers'

import { DeleteButton } from 'components/widgets/DeleteButton'
import { useT } from 'i18n'

interface DeleteEventVolunteerButtonProps {
  minimal?: boolean
  eventVolunteer: EventVolunteer
}

export function DeleteEventVolunteerButton({ minimal, eventVolunteer }: DeleteEventVolunteerButtonProps) {
  const t = useT('routes.events.event.volunteers')
  const [deleteEventVolunteer] = useDeleteEventVolunteer({ refetchQueries: ['getEventVolunteers'] })

  const handleDelete = () => {
    addGlobalLoadingAnimation(deleteEventVolunteer({ id: eventVolunteer._id }))
  }

  return <DeleteButton
    requireRight="eventVolunteers:delete"
    entityId={eventVolunteer._id}
    minimal={minimal}
    onDelete={handleDelete}
    iconOnly={minimal}
    disabled={eventVolunteer._isRegistered}
    text={t('deleteVolunteer')}
    tooltip={t(eventVolunteer._isRegistered ? 'cannotDeleteRegisteredVolunteer' : 'deleteVolunteer')}
    confirmText={t('deleteConfirmation')}
  />
}
