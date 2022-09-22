import React, {useCallback} from 'react';
import {DeleteButton} from "components/widgets/DeleteButton";
import {DanceDataImportButton} from "components/DanceDataImportDialog";
import {H2} from "@blueprintjs/core";
import {Dance} from "services/dances";
import {DanceEditor} from './DanceEditor';
import { Flex } from 'components/Flex';
import useAutosavingState, {makePartial} from 'utils/useAutosavingState';
import SyncStatus from 'components/SyncStatus';

interface DanceListItemProps {
  dance: Dance,
  onChange: (changed: Partial<Dance>) => any,
  onDelete?: any,
}

export function DanceListItem({dance: danceInDatabase, onChange, onDelete} : DanceListItemProps) {
  const patchDance = useCallback(
    (patches : Partial<Dance>) => {
      onChange({_id: danceInDatabase._id, ...patches})
    },
    [onChange, danceInDatabase._id]
  )
  const [dance, setDance, resolveConflict, {state}] = useAutosavingState<Dance,Partial<Dance>>(danceInDatabase, patchDance, makePartial)
  return <>
    <SyncStatus state={state} />
    <Flex alignItems="end">
      <H2 className="flex-fill">{dance.name}</H2>
      <DeleteButton onDelete={() => onDelete(dance)}
        text="Poista tanssi"
        confirmText="Haluatko varmasti poistaa tämän tanssin?"
      />
      <DanceDataImportButton text="Hae tietoja tanssiwikistä" dance={dance} onImport={setDance} />
    </Flex>
    <DanceEditor dance={dance} onChange={setDance} />
  </>;
}
