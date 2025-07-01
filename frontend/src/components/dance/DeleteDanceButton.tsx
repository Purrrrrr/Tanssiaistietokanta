import {DanceWithEvents } from 'types'

import { useDeleteDance } from 'services/dances'

import {useGlobalLoadingAnimation} from 'components/LoadingState'
import {DeleteButton} from 'components/widgets/DeleteButton'
import { useT } from 'i18n'

interface DeleteDanceButtonProps {
  minimal?: boolean
  dance: DanceWithEvents
  onDelete?: () => unknown
}

export function DeleteDanceButton({minimal, dance, onDelete} : DeleteDanceButtonProps) {
  const t = useT('components.danceEditor')
  const addLoadingAnimation = useGlobalLoadingAnimation()
  const [deleteDance] = useDeleteDance()
  const handleDelete = () => {
    addLoadingAnimation(deleteDance({id: dance._id}))
    onDelete?.()
  }

  return <DeleteButton
    minimal={minimal}
    onDelete={handleDelete}
    disabled={dance.events.length > 0}
    iconOnly={minimal}
    text={t('deleteDance')}
    confirmText={t('deleteConfirmation')}
  />
}

