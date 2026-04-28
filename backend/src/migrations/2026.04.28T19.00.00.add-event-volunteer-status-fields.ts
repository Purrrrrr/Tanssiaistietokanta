import { MigrationFn } from '../umzug.context'

export const up: MigrationFn = async params => {
  await params.context.updateDatabase('eventVolunteers', (record: any) => ({
    ...record,
    status: 'Accepted',
    acceptedRoles: record.interestedIn ?? [],
  }))
  await params.context.updateDatabase('eventVolunteerAssignments', (record: any) => ({
    ...record,
    registrationStatus: 'None',
  }))
}

export const down: MigrationFn = async params => {
  await params.context.updateDatabase('eventVolunteers', ({ status: _status, acceptedRoles: _acceptedRoles, ...record }: any) => record)
  await params.context.updateDatabase('eventVolunteerAssignments', ({ registrationStatus: _, ...record }: any) => record)
}
