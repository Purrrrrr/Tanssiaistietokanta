/** @type {import('umzug').MigrationFn<any>} */
exports.up = async params => {
  const models = ['events', 'dances', 'workshops']
    .map(name => ({
      model: params.context.getModel(name),
      versionModel: params.context.getVersionModel(name),
    }))

  const now = () => new Date().toISOString()

  await Promise.all(models.map(
    async ({model, versionModel}) => Promise.all(
      (await model.findAsync({})).map(({ _id, ...record }) =>
        versionModel.insertAsync({
          _updatedAt: now(),
          _createdAt: now(),
          ...record,
          _recordId: _id
        })
      )
    )
  ))
  /* databases.forEach(db =>
    updateDatabase(db, item => item)) */
}

/** @type {import('umzug').MigrationFn<any>} */
exports.down = async () => {}
