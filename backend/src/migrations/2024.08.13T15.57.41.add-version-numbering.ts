import { MigrationFn } from '../umzug.context';

export const up: MigrationFn = async params => {
  const { context } = params
  const serviceNames = ['events', 'workshops', 'dances'] as const
  for (const name of serviceNames) {
    const model = context.getModel(name)
    const versionModel = context.getVersionModel(name)
    const counter = new VersionCounter()

    const records = await versionModel.findAsync({}).sort({ _updatedAt: 1 })
    for (const record of records) {
      const { _id, _recordId } = record
      const _versionNumber = counter.getVersionFor(_recordId)
      await versionModel.updateAsync({ _id }, { $set: { _versionNumber } })
    }
    for (const [_id, _versionNumber] of counter.versionNumberMap.entries()) {
      await model.updateAsync({ _id }, { $set: { _versionNumber } })
    }
  }

}
export const down: MigrationFn = async () => {};

class VersionCounter {
  versionNumberMap = new Map<string, number>()

  getVersionFor(id: string): number {
    const version = (this.versionNumberMap.get(id) ?? -1) + 1

    this.versionNumberMap.set(id, version)
    return version
  }
}
