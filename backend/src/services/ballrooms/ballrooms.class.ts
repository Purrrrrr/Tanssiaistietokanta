import type { Params } from '@feathersjs/feathers'
import VersioningNeDBService from '../../utils/VersioningNeDBService'

import type { Application } from '../../declarations'
import type { Ballrooms, BallroomsData, BallroomsPatch, BallroomsQuery } from './ballrooms.schema'

export type { Ballrooms, BallroomsData, BallroomsPatch, BallroomsQuery }

export interface BallroomsServiceOptions {
  app: Application
}

export interface BallroomsParams extends Params<BallroomsQuery> {}

export class BallroomsService<ServiceParams extends BallroomsParams = BallroomsParams>
  extends VersioningNeDBService<Ballrooms, BallroomsData, ServiceParams, BallroomsPatch> {
  constructor(public options: BallroomsServiceOptions) {
    super({
      ...options,
      dbname: 'ballrooms',
      indexes: [{ fieldName: ['venueName', 'roomName'], unique: true }],
    })
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
