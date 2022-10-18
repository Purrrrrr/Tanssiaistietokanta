import {Dance} from 'types/Dance'

export interface EventProgramSettings {
  introductions: IntroSection
  danceSets: DanceSet[]
  slideStyleId: string | null
}

export interface Section {
  isIntroductionsSection: boolean
  program: EventProgramRow[]
}

export interface IntroSection extends Section {
  isIntroductionsSection: true
  program: EventProgramRow[]
  intervalMusicDuration: 0
}
export interface DanceSet extends Section {
  isIntroductionsSection: false
  _id: string
  name: string
  program: EventProgramRow[]
  intervalMusicDuration: number
}

export type EventProgramRow = {
  _id: string
  item: EventProgramItem
  slideStyleId?: string
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
  description?: string
  duration?: number
}
