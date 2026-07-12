import { useState } from 'react'

import { Ballroom } from 'types'

import { usePatchBallroom } from 'services/ballrooms'

import { patchStrategy, useAutosavingState } from 'libraries/forms'
import { Button } from 'libraries/ui'
import { ChevronDown, ChevronUp, Edit } from 'libraries/ui/icons'
import { ItemList, Sort } from 'libraries/ui/ItemList'
import { useT } from 'i18n'
import { sortedBy } from 'utils/sorted'

import { BallroomForm } from './BallroomForm'
import { BallroomFormValues } from './ballroomFormValues'
import { DeleteBallroomButton } from './DeleteBallroomButton'

const editableBallroomFields: (keyof BallroomFormValues)[] = ['venueName', 'roomName']

interface BallroomListProps {
  ballrooms?: Ballroom[]
}

export function BallroomList({ ballrooms: unsortedBallrooms }: BallroomListProps) {
  const t = useT('routes.ballrooms')
  const label = useT('domain.ballroom')
  const [sort, setSort] = useState<Sort>({ key: 'venueName', direction: 'asc' })
  const ballrooms = sortedBy(unsortedBallrooms, { key: ballroomSorter(sort.key), direction: sort.direction }, 'venueName')

  return <>
    <div className="mb-4">
      {ballrooms?.length > 0 && t('Nballrooms', { count: ballrooms.length })}
    </div>
    <ItemList
      items={ballrooms ?? []}
      emptyText={t('noBallrooms')}
      columns="grid-cols-[1fr_1fr_max-content]"
    >
      <ItemList.SortableHeader
        currentSort={sort}
        onSort={setSort}
        columns={[
          { key: 'venueName', label: label('venueName') },
          { key: 'roomName', label: label('roomName') },
        ]}
      />
      {(ballrooms ?? []).map(ballroom =>
        <BallroomListRow key={ballroom._id} ballroom={ballroom} />,
      )}
    </ItemList>
  </>
}

function ballroomSorter(key: string) {
  switch (key) {
    default:
    case 'venueName':
      return (ballroom: Ballroom) => [ballroom.venueName, ballroom.roomName]
    case 'roomName':
      return (ballroom: Ballroom) => ballroom.roomName ?? ''
  }
}

interface BallroomListRowProps {
  ballroom: Ballroom
}

function BallroomListRow({ ballroom }: BallroomListRowProps) {
  const [showEditor, setShowEditor] = useState(false)
  const t = useT('')

  return <ItemList.Row
    expandableContent={<BallroomRowEditor item={ballroom} />}
    isOpen={showEditor}
  >
    <span>{ballroom.venueName}</span>
    <span>{ballroom.roomName ?? '-'}</span>
    <div className="flex gap-1 items-center">
      <DeleteBallroomButton minimal ballroom={ballroom} />
      <Button
        requireRight="ballrooms:modify"
        entityId={ballroom._id}
        minimal
        icon={<Edit />}
        aria-label={t('common.edit')}
        tooltip={t('common.edit')}
        color="primary"
        onClick={() => setShowEditor(!showEditor)}
        rightIcon={showEditor ? <ChevronUp /> : <ChevronDown />}
      />
    </div>
  </ItemList.Row>
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
