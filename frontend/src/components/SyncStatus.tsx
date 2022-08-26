import React from 'react';
import {Intent, Icon} from "@blueprintjs/core";
import {SyncState} from 'utils/useAutosavingState';

export default function SyncStatus({state} : { state : SyncState }) {
  switch(state) {
    case 'IN_SYNC':
      return <><Icon icon="saved" intent={Intent.SUCCESS} /> Tallennettu</>
    case 'MODIFIED_LOCALLY':
      return <><Icon icon="refresh" intent={Intent.PRIMARY} /> Tallennetaan...</>
    case 'CONFLICT':
      return <><Icon icon="outdated" intent={Intent.WARNING} /> Synkronointivirhe</>
  }
  return null
}

