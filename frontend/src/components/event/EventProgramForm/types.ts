import { Event } from 'types'

import { Translator } from 'i18n'

export type T = Translator<'components.eventProgramEditor'>

export type ProgramSectionPath = 'introductions' | DanceSetPath
export type ProgramItemPath = `${ProgramSectionPath}.program.${number}`
export type DanceSetPath = `danceSets.${number}`
export type DanceProgramPath = `${DanceSetPath}.program.${number}`
export type IntervalMusicPath = `${DanceSetPath}.intervalMusic`

export type EventProgramSettings = Event['program']
export type DanceSet = EventProgramSettings['danceSets'][number]
export type IntervalMusic = DanceSet['intervalMusic']

export type EventProgramRow = DanceSet['program'][number]
