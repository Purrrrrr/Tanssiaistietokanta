import { MigrationFn } from '../umzug.context'
import { isNil } from 'es-toolkit'

export const up: MigrationFn = async params => {
  const models = ['events', 'dances', 'workshops']
    .map(name => ({
      model: params.context.getModel(name),
      versionModel: params.context.getVersionModel(name),
    }))

  interface VersionRecord {
    _id: string
    _recordId: string
    _versionNumber: number
    _updatedAt: string
    _createdAt?: string
    _versionCreatedAt?: string
  }

  await Promise.all(models.map(
    async ({ model, versionModel }) => {
      const records = await model.findAsync({})
      const versionsRecords = await versionModel.findAsync<VersionRecord>({})
      const versionsById = Map.groupBy(versionsRecords, v => v._recordId)

      await Promise.all(
        records.map(async (obj) => {
          const { _versionNumber, _createdAt, _id } = obj

          const missingVersionNr = isNil(_versionNumber)
          const missingCreated = isNil(_createdAt)
          const versions = versionsById.get(_id) ?? []
          const versionCount = versions.length
          const currentVersionNumber = Math.max(
            ...versions.map(v => v._versionNumber), 0,
          )

          if (missingVersionNr || missingCreated || versionCount === 0) {
            // console.log({
            //  name, missingCreated, missingVersionNr, versionCount, id: _id,
            //  maxNumber,
            // })
          }

          const updatedValues = {
            _versionNumber: _versionNumber ?? currentVersionNumber,
            _createdAt: _createdAt ?? obj._updatedAt,
          }

          if (missingVersionNr || missingCreated) {
            const updated = { ...obj, ...updatedValues }
            await model.updateAsync({ _id }, updated)
          }

          if (versionCount === 0) {
            const { _id, ...rest } = obj
            const version = {
              ...rest,
              _recordId: _id,
              ...updatedValues,
              _versionCreatedAt: updatedValues._createdAt,
            }

            await versionModel.insertAsync(version)
          } else {
            for (const version of versions) {
              const missingVersionCreatedAt = isNil(version._versionCreatedAt)

              if (missingCreated || missingVersionCreatedAt) {
                const updatedVersion = {
                  ...version,
                  _createdAt: version._createdAt ?? updatedValues._createdAt,
                  _versionCreatedAt: version._versionCreatedAt ?? version._updatedAt,
                }

                await versionModel.updateAsync({ _id: version._id }, updatedVersion)
              }
            }
          }
        }),
      )
    },
  ))
}

export const down: MigrationFn = async () => {}
