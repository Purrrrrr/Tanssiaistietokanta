/** @type {import('umzug').MigrationFn<any>} */
exports.up = async params => {
  const {
    ['event-program']: eventsProgramDb
  } = params.context.models

  const eventProgramItems = await eventsProgramDb.findAsync()

  for (const item of eventProgramItems) {
    await eventsProgramDb.updateAsync({ _id: item._id}, {...item, showInLists: true})
  }
}

/** @type {import('umzug').MigrationFn<any>} */
exports.down = async () => {}
