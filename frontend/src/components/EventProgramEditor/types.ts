import {Dance} from 'types/Dance'

export interface EventProgramSettings {
  introductions: IntroSection 
  danceSets: DanceSet[]
  slideStyleId: string | null
}

export interface Section {
  isIntroductionsSection: boolean
  program: EventProgramItem[] | EventProgram[]
}

export interface IntroSection extends Section {
  isIntroductionsSection: true
  program: EventProgram[]
  intervalMusicDuration: 0
}
export interface DanceSet extends Section {
  isIntroductionsSection: false
  _id: string
  name: String
  program: EventProgramItem[]
  intervalMusicDuration: number
}

export type EventProgramItem = DanceProgram | EventProgram | RequestedDance

export interface DanceProgram extends ProgramItem, Omit<Dance, "_id"> {
  __typename: 'DanceProgram'
}
export interface RequestedDance {
  __typename: 'RequestedDance'
  _id?: never
  slideStyleId?: string
}

export interface EventProgram extends ProgramItem {
  __typename: 'EventProgram'
  showInLists: boolean
}

export interface ProgramItem {
  _id: string
  name: string
  description?: string
  duration?: number
  slideStyleId?: string
}
