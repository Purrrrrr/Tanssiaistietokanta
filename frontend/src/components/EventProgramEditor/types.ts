import {Dance, Event} from 'types'

export type ProgramSectionPath = 'introductions' | DanceSetPath
export type ProgramItemPath = `${ProgramSectionPath}.program.${number}`
export type DanceSetPath = `danceSets.${number}`
export type DanceProgramPath = `${DanceSetPath}.program.${number}`

type Program = Event['program']
type ODanceSet = Program['danceSets'][number]

export type EventProgramSettings = Program & {
  danceSets: DanceSet[]
}

export type DanceSet = ODanceSet & {
  program: EventProgramRow[]
}

export type EventProgramRow = {
  _id: string
  item: EventProgramItem
  slideStyleId?: string | null
}
export type EventProgramItem = DanceProgram | EventProgram | RequestedDance

export type DanceProgram = Dance & {
  __typename: 'Dance'
}

export type RequestedDance = {
  __typename: 'RequestedDance'
  duration?: never
  _id?: never
}

export type EventProgram = ProgramItem & {
  __typename: 'EventProgram'
  showInLists: boolean
}

export type ProgramItem = {
  _id?: string
  name: string
  description?: string | null
  duration?: number | null
}
