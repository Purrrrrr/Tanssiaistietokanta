import { Ballroom } from 'types'

import { addGlobalLoadingAnimation } from 'backend'
import { useDeleteBallroom } from 'services/ballrooms'

import { DeleteButton } from 'components/widgets/DeleteButton'
import { useT } from 'i18n'

interface DeleteBallroomButtonProps {
  minimal?: boolean
  ballroom: Ballroom
}

export function DeleteBallroomButton({ minimal, ballroom }: DeleteBallroomButtonProps) {
  const t = useT('routes.ballrooms')
  const [deleteBallroom] = useDeleteBallroom({ refetchQueries: ['getBallrooms'] })

  const handleDelete = () => {
    addGlobalLoadingAnimation(deleteBallroom({ id: ballroom._id }))
  }

  return <DeleteButton
    requireRight="ballrooms:delete"
    entityId={ballroom._id}
    minimal={minimal}
    onDelete={handleDelete}
    iconOnly={minimal}
    text={t('deleteBallroom')}
    tooltip={t('deleteBallroom')}
    confirmText={t('deleteConfirmation')}
  />
}
