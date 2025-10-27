import { SyncState } from './useAutosavingState'

export const formStringDefaults = {
  dateTime: {
    dateFormat: 'dd.MM.yyyy',
    dateTimeFormat: 'dd.MM.yyyy HH:mm',
  },
  validation: {
    required: 'Täytä kenttä',
    requiredList: 'Kentän täytyy sisältää ainakin yksi arvo',
  },
  moveItem: 'Siirrä',
  hasConflicts: 'Tekemäsi muokkaukset ovat ristiriidassa jonkun muun tekemien muutosten kanssa:',
  conflictButton: 'Selvitä ristiriidat',
  local: 'Omat muokkauksesi',
  server: 'Palvelimen versio',
  chooseThis: 'Valitse tämä versio',
  markdownEditor: {
    insertQRCode: 'Syötä QR-koodi',
    helpUrl: 'https://github.com/akx/markdown-cheatsheet-fi/blob/master/Markdown-Ohje.md',
    help: 'Ohjeita',
  },
  syncState: {
    IN_SYNC: 'Tallennettu',
    MODIFIED_LOCALLY: 'Tallennetaan...',
    CONFLICT: 'Synkronointivirhe',
    INVALID: 'Tiedoissa virheitä',
  } satisfies Record<SyncState, string>,
}

export type FormStrings = typeof formStringDefaults
