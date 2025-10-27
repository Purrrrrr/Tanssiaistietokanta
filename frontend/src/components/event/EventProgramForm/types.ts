import { EditableDance, Event } from 'types'

import { Translator } from 'i18n'

export type T = Translator<'components.eventProgramEditor'>

export type ProgramSectionPath = 'introductions' | DanceSetPath
export type ProgramItemPath = `${ProgramSectionPath}.program.${number}`
export type DanceSetPath = `danceSets.${number}`
export type DanceProgramPath = `${DanceSetPath}.program.${number}`
export type IntervalMusicPath = `${DanceSetPath}.intervalMusic`

type Program = Event['program']
type ODanceSet = Program['danceSets'][number]
export type IntervalMusic = ODanceSet['intervalMusic']

export type EventProgramSettings = Program & {
  danceSets: DanceSet[]
}

export type DanceSet = ODanceSet & {
  program: EventProgramRow[]
}

// Mergeable entity type check fails it this is an interface
/* eslint-disable-next-line @typescript-eslint/consistent-type-definitions */
export type EventProgramRow = {
  _id: string
  item: EventProgramItem
  slideStyleId?: string | null
}
export type EventProgramItem = DanceProgram | EventProgram | RequestedDance

export type DanceProgram = EditableDance & {
  __typename: 'Dance'
}

/* eslint-disable-next-line @typescript-eslint/consistent-type-definitions */
export type RequestedDance = {
  __typename: 'RequestedDance'
  duration?: never
  _id?: never
}

export type EventProgram = ProgramItem & {
  __typename: 'EventProgram'
  showInLists: boolean
}

/* eslint-disable-next-line @typescript-eslint/consistent-type-definitions */
export type ProgramItem = {
  _id?: string
  name: string
  description?: string | null
  duration?: number | null
}
