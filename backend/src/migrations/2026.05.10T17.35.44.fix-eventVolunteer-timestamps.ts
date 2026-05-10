import { MigrationFn } from '../umzug.context'

export const up: MigrationFn = async params => {
  const evaTimestampsByEvId = new Map<string, string>()
  const evas = await params.context.getVersionModel('eventVolunteerAssignments').findAsync({})
  evas.forEach(eva => {
    const { _recordId, _createdAt } = eva
    const currentTs = evaTimestampsByEvId.get(_recordId)
    if (!currentTs || currentTs > _createdAt) {
      evaTimestampsByEvId.set(_recordId, _createdAt)
    }
  })

  // Fix timestamp forgotten in the previous migration
  await params.context.updateDatabase('eventVolunteers', (record: any) => {
    const lowestTimestamp = evaTimestampsByEvId.get(record._recordId ?? record._id)
    if (!lowestTimestamp) return
    if (record._createdAt <= lowestTimestamp) return
    const update = {
      _createdAt: lowestTimestamp,
      _updatedAt: lowestTimestamp,
    } as any
    if (record._versionCreatedAt) update._versionCreatedAt = lowestTimestamp
    return {
      ...record,
      ...update,
    }
  })
}

export const down: MigrationFn = async _params => {}
