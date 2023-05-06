import { MigrationFn } from '../umzug.context';

export const up: MigrationFn = async params => {
  const models = ['events', 'dances', 'workshops']
    .map(name => ({
      model: params.context.getModel(name),
      versionModel: params.context.getVersionModel(name),
    }))

  const now = () => new Date().toISOString()

  await Promise.all(models.map(
    async ({model, versionModel}) => Promise.all(
      (await model.findAsync({})).map(({ _id, ...record }: any) =>
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

export const down: MigrationFn = async () => {};
