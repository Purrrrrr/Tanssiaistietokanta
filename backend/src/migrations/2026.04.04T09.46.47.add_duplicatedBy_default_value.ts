import { MigrationFn } from '../umzug.context'

export const up: MigrationFn = async params => {
  await params.context.updateDatabase('volunteers', volunteer => ({ duplicatedBy: null, ...volunteer }))
}

export const down: MigrationFn = async () => {}
