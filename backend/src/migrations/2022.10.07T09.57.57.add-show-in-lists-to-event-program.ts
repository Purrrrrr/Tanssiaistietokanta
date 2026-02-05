import { MigrationFn } from '../umzug.context'

export const up: MigrationFn = async params => {
  const eventsProgramDb = params.context.getModel('event-program')

  const eventProgramItems = await eventsProgramDb.findAsync({})

  for (const item of eventProgramItems) {
    await eventsProgramDb.updateAsync({ _id: item._id }, { ...item, showInLists: true })
  }
}

export const down: MigrationFn = async () => {}
