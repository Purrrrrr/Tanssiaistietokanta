import updateDatabase from '../utils/updateDatabase'
import evolve from '../utils/evolveObjAsync'
import * as L from 'partial.lenses'
import { MigrationFn } from '../umzug.context'

export const up: MigrationFn = async params => {
  const eventsDb = params.context.getModel('events')
  const eventProgramDb = params.context.getModel('event-program')

  await updateDatabase(eventsDb, evolve({
    program: {
      introductions: {
        program: L.modifyAsync(L.elems, inlineProgram),
      },
      danceSets: L.modifyAsync([L.elems, 'program', L.elems], inlineProgram),
    },
  }))

  async function inlineProgram(row: any) {
    const { eventProgramId, danceId, __typename, ...rowProps } = row
    if (row.__typename === 'Dance') return {
      ...rowProps,
      type: __typename,
      dance: danceId,
    }
    if (row.__typename !== 'EventProgram') {
      return {
        type: __typename,
        ...rowProps,
      }
    }

    const program = await eventProgramDb.findOneAsync({ _id: eventProgramId })
    delete (program as Partial<Record<string, unknown>>)._id

    return {
      ...rowProps,
      type: __typename,
      eventProgram: program,
    }
  }
}

export const down: MigrationFn = async () => {}
