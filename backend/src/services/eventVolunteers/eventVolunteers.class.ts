import type { Params } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import type { EventVolunteers, EventVolunteersData, EventVolunteersPatch, EventVolunteersQuery } from './eventVolunteers.schema'
import VersioningNeDBService from '../../utils/VersioningNeDBService'

export type { EventVolunteers, EventVolunteersData, EventVolunteersPatch, EventVolunteersQuery }

export interface EventVolunteersServiceOptions {
  app: Application
}

export interface EventVolunteersParams extends Params<EventVolunteersQuery> {}

export class EventVolunteersService<ServiceParams extends EventVolunteersParams = EventVolunteersParams>
  extends VersioningNeDBService<EventVolunteers, EventVolunteersData, ServiceParams, EventVolunteersPatch> {
  constructor(public options: EventVolunteersServiceOptions) {
    super({
      ...options,
      dbname: 'eventVolunteers',
      indexes: [{ fieldName: ['eventId', 'volunteerId'], unique: true }],
    })
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
