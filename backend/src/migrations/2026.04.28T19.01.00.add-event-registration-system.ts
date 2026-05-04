import { EventVolunteersService } from '../services/eventVolunteers/eventVolunteers.class'
import { MigrationFn } from '../umzug.context'

export const up: MigrationFn = async params => {
  const evService = params.context.getService('eventVolunteers') as EventVolunteersService
  await params.context.updateDatabase('events', async (record: any) => ({
    ...record,
    eventRegistrationSystem: (record.name as string).includes('Ropecon') ? 'Kompassi' : 'None',
    _hasAcceptedVolunteers: await evService.exists({ query: { eventId: record._recordId ?? record._id, status: 'Accepted', atDate: record._updatedAt } }),
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
