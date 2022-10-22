import React, {useCallback} from 'react'
import {DeleteButton} from 'components/widgets/DeleteButton'
import {DanceDataImportButton} from 'components/DanceDataImportDialog'
import {H2} from 'libraries/ui'
import {Dance, DancePatchInput} from 'types'
import {DanceEditor} from './DanceEditor'
import { Flex } from 'components/Flex'
import useAutosavingState, {makePartial} from 'utils/useAutosavingState'
import SyncStatus from 'components/SyncStatus'

interface DanceListItemProps {
  dance: Dance
  onChange: (vars: {id: string, dance: DancePatchInput}) => unknown
  onDelete?: (vars: {id:string}) => unknown
}

export function DanceListItem({dance: danceInDatabase, onChange, onDelete} : DanceListItemProps) {
  const patchDance = useCallback(
    (patches : Partial<Dance>) => {
      onChange({id: danceInDatabase._id, dance: patches})
    },
    [onChange, danceInDatabase._id]
  )
  const [dance, setDance, {state}] = useAutosavingState<Dance, Partial<Dance>>(danceInDatabase, patchDance, makePartial)
  return <>
    <Flex alignItems="center">
      <H2 className="flex-fill">
        {dance.name}
        <SyncStatus style={{marginLeft: '1ch', top: '3px'}} className="flex-fill" state={state} />
      </H2>
      <div>
        <DeleteButton onDelete={() => onDelete && onDelete({id: dance._id})}
          text="Poista tanssi"
          confirmText="Haluatko varmasti poistaa tämän tanssin?"
        />
        <DanceDataImportButton text="Hae tietoja tanssiwikistä" dance={dance} onImport={setDance} />
      </div>
    </Flex>
    <DanceEditor dance={dance} onChange={setDance} />
  </>
}
