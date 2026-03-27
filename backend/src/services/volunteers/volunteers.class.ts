import type { Params } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import type { Volunteers, VolunteersData, VolunteersPatch, VolunteersQuery } from './volunteers.schema'
import VersioningNeDBService from '../../utils/VersioningNeDBService'

export type { Volunteers, VolunteersData, VolunteersPatch, VolunteersQuery }

export interface VolunteersServiceOptions {
  app: Application
}

export interface VolunteersParams extends Params<VolunteersQuery> {}

export class VolunteersService<ServiceParams extends VolunteersParams = VolunteersParams>
  extends VersioningNeDBService<Volunteers, VolunteersData, ServiceParams, VolunteersPatch> {
  constructor(public options: VolunteersServiceOptions) {
    super({
      ...options,
      dbname: 'volunteers',
      indexes: [{ fieldName: ['name'], unique: true }],
    })
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
