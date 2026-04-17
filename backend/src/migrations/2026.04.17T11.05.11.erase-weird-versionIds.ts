import { MigrationFn } from '../umzug.context'

export const up: MigrationFn = async params => {
  await params.context.updateDatabase('workshops', (workshop: any) => {
    if (workshop._versionId === '.') {
      const { _versionId, ...rest } = workshop
      return rest
    }
    return workshop
  })
}

export const down: MigrationFn = async _params => {}
