import { MigrationFn } from '../umzug.context';

export const up: MigrationFn = async params => {
  const { context } = params
  const serviceNames = ['events', 'workshops', 'dances'] as const
  for (const name of serviceNames) {
    const model = context.getModel(name)
    const versionModel = context.getVersionModel(name)

    const existingIds = new Set((await model.findAsync({})).map(r => r._id))
    const records = await versionModel.findAsync({}).sort({ _updatedAt: -1 })
    for (const record of records) {
      const { _id, _recordId, _updatedAt } = record
      if (!existingIds.has(_recordId)) {
        // console.log(`Deleted ${name} id = ${_recordId} at ${_updatedAt}`)
        // console.log(record)
        const _recordDeletedAt = plus5Minutes(_updatedAt)
        await versionModel.updateAsync({ _id }, { $set: { _recordDeletedAt } })
        existingIds.add(_recordId)
      }
    }
  }
}

export const down: MigrationFn = async () => {};

const fiveMinutes = 5*60*1000
function plus5Minutes(date: string) {
  return new Date(+new Date(date) + fiveMinutes).toISOString()
}
