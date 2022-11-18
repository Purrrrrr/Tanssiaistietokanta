import {Dance, Event} from 'types'

export type ProgramSectionPath = 'introductions' | DanceSetPath
export type ProgramItemPath = `${ProgramSectionPath}.program.${number}`
export type DanceSetPath = `danceSets.${number}`
export type DanceProgramPath = `${DanceSetPath}.program.${number}`

type Program = Event['program']
type ODanceSet = Program['danceSets'][number]
type Introductions = Program['introductions']

export interface EventProgramSettings extends Program {
  introductions: IntroSection
  danceSets: DanceSet[]
}

export interface IntroSection extends Introductions {
  intervalMusicDuration: 0
}
export interface DanceSet extends ODanceSet {
  program: EventProgramRow[]
}

export type EventProgramRow = {
  _id: string
  item: EventProgramItem
  slideStyleId?: string | null
}
export type EventProgramItem = DanceProgram | EventProgram | RequestedDance

export interface DanceProgram extends Dance {
  __typename: 'Dance'
}

export interface RequestedDance {
  __typename: 'RequestedDance'
  duration?: never
  _id?: never
}

export interface EventProgram extends ProgramItem {
  __typename: 'EventProgram'
  showInLists: boolean
}

export interface ProgramItem {
  _id?: string
  name: string
  description?: string | null
  duration?: number | null
}
