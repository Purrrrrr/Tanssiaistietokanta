/** @type {import('umzug').MigrationFn<any>} */
exports.up = async params => {
  const services = ['events', 'dances', 'workshops']
    .map(params.context.getService)

  await Promise.all(services.map(
    async service => Promise.all(
      (await service.find({})).map(record => service.patch(record._id, {}, {saveAsVersion: true}))
    )
  ))
  /* databases.forEach(db =>
    updateDatabase(db, item => item)) */
}

/** @type {import('umzug').MigrationFn<any>} */
exports.down = async () => {}
