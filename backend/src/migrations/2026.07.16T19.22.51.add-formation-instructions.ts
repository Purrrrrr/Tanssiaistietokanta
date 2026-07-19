import { MigrationFn } from '../umzug.context'

export const up: MigrationFn = async params => {
  await params.context.updateDatabase('dances', dance => ({ formationInstructions: [], ...dance }))
  await params.context.updateDatabase('events', event => event.program
    ? ({ ...event, program: { ...event.program, ballroomId: null }, ballroomId: undefined })
    : event,
  )
}

export const down: MigrationFn = async () => {}
