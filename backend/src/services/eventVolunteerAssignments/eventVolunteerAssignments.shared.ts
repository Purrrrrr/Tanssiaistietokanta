// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { EventVolunteerAssignments, EventVolunteerAssignmentsData, EventVolunteerAssignmentsPatch, EventVolunteerAssignmentsQuery, EventVolunteerAssignmentsService } from './eventVolunteerAssignments.class'

export type { EventVolunteerAssignments, EventVolunteerAssignmentsData, EventVolunteerAssignmentsPatch, EventVolunteerAssignmentsQuery }

export type EventVolunteerAssignmentsClientService = Pick<EventVolunteerAssignmentsService<Params<EventVolunteerAssignmentsQuery>>, (typeof eventVolunteerAssignmentsMethods)[number]>

export const eventVolunteerAssignmentsPath = 'eventVolunteerAssignments'

export const eventVolunteerAssignmentsMethods = ['find', 'get', 'create', 'remove'] as const

export const eventVolunteerAssignmentsClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(eventVolunteerAssignmentsPath, connection.service(eventVolunteerAssignmentsPath), {
    methods: eventVolunteerAssignmentsMethods,
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [eventVolunteerAssignmentsPath]: EventVolunteerAssignmentsClientService
  }
}
