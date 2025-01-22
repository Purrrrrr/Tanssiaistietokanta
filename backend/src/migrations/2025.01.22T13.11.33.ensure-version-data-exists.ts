import { MigrationFn } from '../umzug.context';
import { isNil } from 'es-toolkit';

export const up: MigrationFn = async params => {
  const models = ['events', 'dances', 'workshops']
    .map(name => ({
      name,
      model: params.context.getModel(name),
      versionModel: params.context.getVersionModel(name),
    }))

  //const now = new Date().toISOString()
  type VersionRecord = { _recordId: string, _versionNumber: number }

  await Promise.all(models.map(
    async ({name, model, versionModel}) => {
      const records = await model.findAsync({})
      const versionsRecords = await versionModel.findAsync<VersionRecord>({})
      const versionsById = Map.groupBy(versionsRecords, v => v._recordId)

      await Promise.all(
        records.map(async (obj) => {
          const { _versionNumber, _createdAt, _id } = obj

          const missingVersionNr = isNil(_versionNumber)
          const missingCreated = isNil(_createdAt)
          const versionCount = (versionsById.get(_id) ?? []).length
          const currentVersionNumber = Math.max(
            ...versionsById.get(_id)?.map(v => v._versionNumber) ?? [0]
          )

          if (missingVersionNr || missingCreated || versionCount === 0) {
            //console.log({
            //  name, missingCreated, missingVersionNr, versionCount, id: _id,
            //  maxNumber,
            //})
          }

          const updatedValues = {
            _versionNumber: _versionNumber ?? currentVersionNumber,
            _createdAt: _createdAt ?? obj._updatedAt
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
          }

        })
      )
    }
  ))
}

export const down: MigrationFn = async () => {};
