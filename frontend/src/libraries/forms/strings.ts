import {SyncState} from './useAutosavingState'

export const formStringDefaults = {
  dateTime: {
    dateFormat: 'dd.MM.yyyy',
    dateTimeFormat: 'dd.MM.yyyy HH:mm',
    months: [
      'tammikuu',
      'helmikuu',
      'maaliskuu',
      'huhtikuu',
      'toukokuu',
      'kesäkuu',
      'heinäkuu',
      'elokuu',
      'syyskuu',
      'lokakuu',
      'marraskuu',
      'joulukuu',
    ],
    shortWeekdays: [
      'ma',
      'ti',
      'ke',
      'to',
      'pe',
      'la',
      'su',
    ],
    firstDayOfWeek: 'ma',
    invalidDateMessage: 'Epäkelpo päivämäärä',
    outOfRangeMessage: 'Sallitun alueen ulkopuolella',
    overlappingDatesMessage: 'Päällekkäinen päivämäärä',
  },
  validation: {
    required: 'Täytä kenttä',
    requiredList: 'Kentän täytyy sisältää ainakin yksi arvo',
  },
  moveItem: 'Siirrä',
  hasConflicts: 'Kentässä on ristiriitoja',
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
    INVALID: 'Tiedoissa virheitä, tallennus pysäytetty',
  } satisfies Record<SyncState, string>,
} as const

export type FormStrings = Stringize<typeof formStringDefaults>

type Stringize<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends object ? Stringize<T[K]> : T[K]
}
