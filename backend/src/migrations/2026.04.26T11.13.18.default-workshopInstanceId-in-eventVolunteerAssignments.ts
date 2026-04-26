import { assoc } from 'ramda'
import { MigrationFn } from '../umzug.context'

export const up: MigrationFn = async params => {
  await params.context.updateDatabase('eventVolunteerAssignments', assoc('workshopInstanceId', null))
}

export const down: MigrationFn = async _params => {}
