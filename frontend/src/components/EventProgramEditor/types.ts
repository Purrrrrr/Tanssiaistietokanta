import {Dance} from 'types'

export interface EventProgramSettings {
  introductions: IntroSection
  danceSets: DanceSet[]
  slideStyleId: string | null
}

export interface Section {
  program: EventProgramRow[]
}

export interface IntroSection extends Section {
  intervalMusicDuration: 0
}
export interface DanceSet extends Section {
  _id: string
  name: string
  intervalMusicDuration: number
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
