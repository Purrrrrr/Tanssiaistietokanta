import { Event } from 'types'

import { addGlobalLoadingAnimation } from 'backend'
import { canDeleteWorkshop, useDeleteWorkshop } from 'services/workshops'

import { DeleteButton } from 'components/widgets/DeleteButton'
import { useT } from 'i18n'

type Workshop = Event['workshops'][0]

export function DeleteWorkshopButton(
  {
    workshop, eventId, onDelete,
  }: {
    workshop: Workshop
    eventId: string
    onDelete?: () => void
  },
) {
  // TODO: own translation keys?
  const t = useT('routes.events.event.workshop')
  const [deleteWorkshop] = useDeleteWorkshop({ refetchQueries: ['getEvent'] })

  return <DeleteButton
    minimal
    requireRight="workshops:delete"
    owner="events"
    owningId={eventId}
    disabled={!canDeleteWorkshop(workshop)}
    onDelete={async () => {
      await addGlobalLoadingAnimation(deleteWorkshop({ id: workshop._id }))
      onDelete?.()
    }}
    className="float-right" text={t('delete')}
    confirmText={t('deleteConfirmation')}
  />
}
