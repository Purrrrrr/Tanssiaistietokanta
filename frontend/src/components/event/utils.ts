import { EventProgramRow, IntervalMusic, T } from './EventProgramForm/types'

import { guid } from 'utils/guid'

export const DEFAULT_INTERVAL_MUSIC_DURATION = 15 * 60
export const DEFAULT_INTERVAL_MUSIC = {
  name: null,
  description: null,
  duration: DEFAULT_INTERVAL_MUSIC_DURATION,
  slideStyleId: null,
  showInLists: false,
  danceId: null,
  dance: null,
} satisfies IntervalMusic

interface SimpleEventProgramRow {
  type: EventProgramRow['type']
  dance?: { name: string, duration?: number | null } | null
  eventProgram?: { name: string, duration?: number | null } | null
}

export function newRequestedDanceEventProgramRow(): EventProgramRow {
  return newEventProgramRow({
    type: 'RequestedDance',
  })
}

export function newEventProgramEventProgramRow(program: Partial<EventProgramRow['eventProgram']>): EventProgramRow {
  return newEventProgramRow({
    type: 'EventProgram',
    eventProgram: {
      name: '',
      // @ts-expect-error This will be there some day
      nameInLists: null,
      description: '',
      duration: 0,
      showInLists: false,
      ...program,
    },
  })
}

export function newEventProgramRow(program: Pick<EventProgramRow, 'type'> & Partial<Pick<EventProgramRow, 'dance' | 'danceId' | 'eventProgram'>>): EventProgramRow {
  return {
    _id: guid(),
    slideStyleId: null,
    eventProgram: null,
    dance: null,
    danceId: null,
    ...program,
  }
}

export function getProgramName({ type, dance, eventProgram }: SimpleEventProgramRow, t: T) {
  if (type === 'RequestedDance') return t('programTypes.RequestedDance')
  return dance?.name ?? eventProgram?.name ?? ''
}

export function getProgramDuration(row: SimpleEventProgramRow): number {
  if (row.eventProgram) {
    return row.eventProgram.duration ?? 0
  }
  return row.dance?.duration ?? 0
}
