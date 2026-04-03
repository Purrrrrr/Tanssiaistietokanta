import { DanceWithEvents } from 'types'

import { addGlobalLoadingAnimation } from 'backend'
import { useDeleteDance } from 'services/dances'

import { DeleteButton } from 'components/widgets/DeleteButton'
import { useT } from 'i18n'

interface DeleteDanceButtonProps {
  minimal?: boolean
  dance: Pick<DanceWithEvents, '_id' | 'events'>
  onDelete?: () => unknown
}

export function DeleteDanceButton({ minimal, dance, onDelete }: DeleteDanceButtonProps) {
  const t = useT('components.danceEditor')
  const [deleteDance] = useDeleteDance()
  const handleDelete = () => {
    addGlobalLoadingAnimation(deleteDance({ id: dance._id }))
    onDelete?.()
  }

  return <DeleteButton
    requireRight="dances:delete"
    entityId={dance._id}
    minimal={minimal}
    onDelete={handleDelete}
    disabled={dance.events.length > 0}
    iconOnly={minimal}
    text={t('deleteDance')}
    tooltip={t('deleteDance')}
    confirmText={t('deleteConfirmation')}
  />
}
