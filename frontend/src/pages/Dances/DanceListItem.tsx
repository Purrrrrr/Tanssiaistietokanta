import React, {useState,useCallback} from 'react';
import {DeleteButton} from "components/widgets/DeleteButton";
import {DanceDataImportButton} from "components/DanceDataImportDialog";
import {H2} from "@blueprintjs/core";
import {Dance} from "services/dances";
import {DanceEditor} from './DanceEditor';
import { Flex } from 'components/Flex';
import { useDelayedEffect} from 'utils/useDelayedEffect';

interface DanceListItemProps {
  dance: Dance,
  onChange: (changed: Dance) => any,
  onDelete?: any,
}

export function DanceListItem({dance: danceInDatabase, onChange, onDelete} : DanceListItemProps) {
  const [dance, setDance] = useState(danceInDatabase);
  useDelayedEffect(500,
    useCallback(() => {
      if (dance !== danceInDatabase) onChange(dance)
    }, [dance, danceInDatabase, onChange])
  );
  return <>
    <Flex alignItems="end">
      <H2 className="flex-fill">{dance.name}</H2>
      <DeleteButton onDelete={() => onDelete(dance)}
        text="Poista tanssi"
        confirmText="Haluatko varmasti poistaa tämän tanssin?"
      />
      <DanceDataImportButton text="Hae tietoja tanssiwikistä"
        dance={dance}
        onImport={setDance}
      />
    </Flex>
    <DanceEditor dance={dance} onChange={setDance} />
  </>;
}
