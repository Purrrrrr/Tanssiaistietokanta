import { MigrationFn } from '../umzug.context'

export const up: MigrationFn = async params => {
  const { context } = params
  await context.getVersionModel('eventVolunteers').removeIndexAsync(['eventId', 'volunteerId'])
  await context.getVersionModel('eventVolunteers').ensureIndexAsync({ fieldName: ['eventId', 'volunteerId'] })
  await context.getVersionModel('volunteers').removeIndexAsync('name')
  await context.getVersionModel('volunteers').ensureIndexAsync({ fieldName: ['name'] })
}

export const down: MigrationFn = async _params => {}
