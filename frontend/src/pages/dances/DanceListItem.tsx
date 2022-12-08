import React, {useCallback} from 'react'
import {Link} from 'react-router-dom'

import { useDeleteDance, usePatchDance } from 'services/dances'

import {patchStrategy, SyncStatus, useAutosavingState} from 'libraries/forms'
import {H2, Icon} from 'libraries/ui'
import {DanceDataImportButton} from 'components/DanceDataImportDialog'
import {Flex} from 'components/Flex'
import {DeleteButton} from 'components/widgets/DeleteButton'

import {Dance} from 'types'

import {DanceEditor} from './DanceEditor'

interface DanceListItemProps {
  dance: Dance
  onDelete?: () => unknown
  showLink?: boolean
  titleComponent?: React.JSXElementConstructor<{className: string, children: React.ReactNode}> | 'h1'
}

export function DanceListItem({dance: danceInDatabase, onDelete, showLink, titleComponent: Title = H2} : DanceListItemProps) {
  const [deleteDance] = useDeleteDance()
  const [modifyDance] = usePatchDance()
  const patchDance = useCallback(
    (patches : Partial<Dance>) => {
      modifyDance({id: danceInDatabase._id, dance: patches})
    },
    [modifyDance, danceInDatabase._id]
  )
  const handleDelete = () => {
    deleteDance({id: dance._id})
    onDelete && onDelete()
  }

  const {value: dance, onChange: setDance, state} = useAutosavingState<Dance, Partial<Dance>>(danceInDatabase, patchDance, patchStrategy.partial)
  return <>
    <Flex spaced alignItems="center">
      <Title className="flex-fill">
        {dance.name}
        <SyncStatus style={{marginLeft: '1ch', top: '3px'}} className="flex-fill" state={state} />
      </Title>
      {showLink && <Link to={dance._id}><Icon icon="link"/>Linkki tähän tanssiin</Link>}
      <div>
        <DeleteButton onDelete={handleDelete}
          text="Poista tanssi"
          confirmText="Haluatko varmasti poistaa tämän tanssin?"
        />
        <DanceDataImportButton text="Hae tietoja tanssiwikistä" dance={dance} onImport={setDance} />
      </div>
    </Flex>
    <DanceEditor dance={dance} onChange={setDance} />
  </>
}
