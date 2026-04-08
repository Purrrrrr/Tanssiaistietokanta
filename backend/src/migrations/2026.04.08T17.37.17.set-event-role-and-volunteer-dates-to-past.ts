import { MigrationFn } from '../umzug.context'

const past = new Date('2010-01-01').toISOString()

export const up: MigrationFn = async params => {
  params.context.updateDatabase('eventRoles', role => ({
    ...role,
    _updatedAt: past,
    _createdAt: past,
    _versionCreatedAt: role._versionCreatedAt ? past : undefined,
  }))
  params.context.updateDatabase('volunteers', role => ({
    ...role,
    _updatedAt: past,
    _createdAt: past,
    _versionCreatedAt: role._versionCreatedAt ? past : undefined,
  }))
}

export const down: MigrationFn = async _params => {}
