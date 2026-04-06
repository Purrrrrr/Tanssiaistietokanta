import type { Params } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import type { EventVolunteerAssignments, EventVolunteerAssignmentsData, EventVolunteerAssignmentsPatch, EventVolunteerAssignmentsQuery } from './eventVolunteerAssignments.schema'
import VersioningNeDBService from '../../utils/VersioningNeDBService'

export type { EventVolunteerAssignments, EventVolunteerAssignmentsData, EventVolunteerAssignmentsPatch, EventVolunteerAssignmentsQuery }

export interface EventVolunteerAssignmentsServiceOptions {
  app: Application
}

export interface EventVolunteerAssignmentsParams extends Params<EventVolunteerAssignmentsQuery> {}

export class EventVolunteerAssignmentsService<ServiceParams extends EventVolunteerAssignmentsParams = EventVolunteerAssignmentsParams>
  extends VersioningNeDBService<EventVolunteerAssignments, EventVolunteerAssignmentsData, ServiceParams, EventVolunteerAssignmentsPatch> {
  constructor(public options: EventVolunteerAssignmentsServiceOptions) {
    super({
      ...options,
      dbname: 'eventVolunteerAssignments',
      indexes: [{ fieldName: ['eventId', 'workshopId', 'roleId', 'volunteerId'], unique: true }],
    })
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
