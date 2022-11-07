/** @type {import('umzug').MigrationFn<any>} */
exports.up = async params => {
  const eventsProgramDb = params.context.getModel('event-program')

  const eventProgramItems = await eventsProgramDb.find()

  for (const item of eventProgramItems) {
    await eventsProgramDb.updateAsync({ _id: item._id}, {...item, showInLists: true})
  }
}

/** @type {import('umzug').MigrationFn<any>} */
exports.down = async () => {}
