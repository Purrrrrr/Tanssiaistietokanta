import { Ballroom } from 'types'

import { usePatchBallroom } from 'services/ballrooms'

import { patchStrategy, useAutosavingState } from 'libraries/forms'
import { ItemList2 } from 'libraries/ui'
import { Edit } from 'libraries/ui/icons'
import { useT, useTranslation } from 'i18n'

import { BallroomForm } from './BallroomForm'
import { BallroomFormValues } from './ballroomFormValues'
import { DeleteBallroomButton } from './DeleteBallroomButton'

const editableBallroomFields: (keyof BallroomFormValues)[] = ['venueName', 'roomName', 'map']

interface BallroomListProps {
  ballrooms?: Ballroom[]
}

export function BallroomList({ ballrooms }: BallroomListProps) {
  const t = useT('routes.ballrooms')
  const editStr = useTranslation('common.edit')

  return <>
    <div className="mb-4">
      {ballrooms && ballrooms?.length > 0 && t('Nballrooms', { count: ballrooms.length })}
    </div>
    <ItemList2
      items={ballrooms}
      emptyText={t('noBallrooms')}
      expandableContent={ballroom => <BallroomRowEditor item={ballroom} />}
      expandButtonProps={ballroom => ({
        requireRight: 'ballrooms:modify',
        entityId: ballroom._id,
        'aria-label': editStr,
        tooltip: editStr,
        icon: <Edit />,
        color: 'primary',
      })}
      labelTranslator={useT('domain.ballroom')}
      columns={[
        {
          key: 'venueName',
          sortBy: ['venueName', 'roomName'],
          width: '1fr',
        },
        {
          key: 'roomName',
          width: '1fr',
        },
      ]}
      actions={ballroom => <DeleteBallroomButton minimal ballroom={ballroom} />}
    />
  </>
}

function BallroomRowEditor({ item }: { item: Ballroom }) {
  const [patchBallroom] = usePatchBallroom()
  const { formProps, state } = useAutosavingState<BallroomFormValues, unknown[]>(
    item,
    async ballroom => {
      await patchBallroom({
        id: item._id,
        ballroom,
      })
    },
    patchStrategy.jsonPatchWithFields(editableBallroomFields),
  )

  return <BallroomForm
    {...formProps}
    syncState={state}
    className="p-4"
  />
}
