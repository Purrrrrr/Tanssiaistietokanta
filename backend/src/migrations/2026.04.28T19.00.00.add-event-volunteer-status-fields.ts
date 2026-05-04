import { SkipAccessControl } from '../services/access/hooks'
import { EventVolunteersService } from '../services/eventVolunteers/eventVolunteers.class'
import { MigrationFn } from '../umzug.context'

export const up: MigrationFn = async params => {
  const evService = params.context.getService('eventVolunteers') as EventVolunteersService
  const eventVolunteerIds = new Map<string, string>()
  // TODO: Fix versioning
  await params.context.updateDatabase('eventVolunteers', (record: any) => {
    eventVolunteerIds.set(`${record.eventId}-${record.volunteerId}`, record._recordId ?? record._id)
    return {
      ...record,
      _isRegistered: false,
      status: 'Accepted',
      acceptedRoles: record.interestedIn ?? [],
    }
  })
  await params.context.updateDatabase('eventVolunteerAssignments', async (record: any) => {
    let eventVolunteerId = eventVolunteerIds.get(`${record.eventId}-${record.volunteerId}`)
    if (!eventVolunteerId) {
      const created = await evService.create({
        eventId: record.eventId,
        volunteerId: record.volunteerId,
        status: 'Accepted',
        interestedIn: [],
      }, {
        [SkipAccessControl]: true,
      })
      eventVolunteerId = created._id
      eventVolunteerIds.set(`${record.eventId}-${record.volunteerId}`, eventVolunteerId)
    }
    return {
      ...record,
      eventVolunteerId,
      registrationStatus: 'None',
    }
  })
}

export const down: MigrationFn = async params => {
  await params.context.updateDatabase('eventVolunteers', ({ status: _status, acceptedRoles: _acceptedRoles, ...record }: any) => record)
  await params.context.updateDatabase('eventVolunteerAssignments', ({ registrationStatus: _, ...record }: any) => record)
}
