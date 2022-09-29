import React from 'react';
import {Icon} from "libraries/ui";
import {SyncState} from 'utils/useAutosavingState';

export default function SyncStatus({state} : { state : SyncState }) {
  switch(state) {
    case 'IN_SYNC':
      return <><Icon icon="saved" intent="success" /> Tallennettu</>
    case 'MODIFIED_LOCALLY':
      return <><Icon icon="refresh" intent="primary" /> Tallennetaan...</>
    case 'CONFLICT':
      return <><Icon icon="outdated" intent="warning" /> Synkronointivirhe</>
  }
  return null
}

