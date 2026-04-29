import { MigrationFn } from '../umzug.context'

export const up: MigrationFn = async params => {
  await params.context.updateDatabase('events', (record: any) => ({
    ...record,
    eventRegistrationSystem: (record.name as string).includes('Ropecon') ? 'Kompassi' : 'None',
  }))
}

export const down: MigrationFn = async params => {
  await params.context.updateDatabase('events', ({ eventRegistrationSystem: _, ...record }: any) => record)
}
