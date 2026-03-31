import type { Params } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import type { EventRoles, EventRolesData, EventRolesPatch, EventRolesQuery } from './eventRoles.schema'
import VersioningNeDBService from '../../utils/VersioningNeDBService'

export type { EventRoles, EventRolesData, EventRolesPatch, EventRolesQuery }

export interface EventRolesServiceOptions {
  app: Application
}

export interface EventRolesParams extends Params<EventRolesQuery> {}

export class EventRolesService<ServiceParams extends EventRolesParams = EventRolesParams>
  extends VersioningNeDBService<EventRoles, EventRolesData, ServiceParams, EventRolesPatch> {
  constructor(public options: EventRolesServiceOptions) {
    super({ ...options, dbname: 'eventRoles' })
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
