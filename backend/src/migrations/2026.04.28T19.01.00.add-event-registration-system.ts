import { MigrationFn } from '../umzug.context'

export const up: MigrationFn = async params => {
  await params.context.updateDatabase('events', (record: any) => ({
    ...record,
    eventRegistrationSystem: (record.name as string).includes('Ropecon') ? 'Kompassi' : 'None',
    _hasRegisteredVolunteers: false,
    _hasRegisteredWorkshops: false,
  }))
  await params.context.updateDatabase('workshops', (record: any) => ({
    ...record,
    registrationStatus: 'None',
    _hasRegisteredVolunteers: false,
  }))
}

export const down: MigrationFn = async params => {
  await params.context.updateDatabase('events', ({ eventRegistrationSystem: _, ...record }: any) => record)
  await params.context.updateDatabase('workshops', ({ registrationStatus: _, ...record }: any) => record)
}
