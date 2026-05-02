import { MigrationFn } from '../umzug.context'

export const up: MigrationFn = async params => {
  await params.context.updateDatabase('events', (record: any) => ({
    ...record,
    eventRegistrationSystem: (record.name as string).includes('Ropecon') ? 'Kompassi' : 'None',
  }))
  await params.context.updateDatabase('workshops', (record: any) => ({
    ...record,
    registrationStatus: 'None',
  }))
}

export const down: MigrationFn = async params => {
  await params.context.updateDatabase('events', ({ eventRegistrationSystem: _, ...record }: any) => record)
  await params.context.updateDatabase('workshops', ({ registrationStatus: _, ...record }: any) => record)
}
