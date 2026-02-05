import type { Params } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import type { Session, SessionData, SessionPatch, SessionQuery } from './sessions.schema'
import { NeDBService } from '../../utils/NeDBService'

export type { Session as Sessions, SessionData as SessionsData, SessionPatch as SessionsPatch, SessionQuery as SessionsQuery }

export interface SessionsServiceOptions {
  app: Application
}

export interface SessionsParams extends Params<SessionQuery> {}

export class SessionsService<ServiceParams extends SessionsParams = SessionsParams>
  extends NeDBService<Session, SessionData, ServiceParams, SessionPatch> {
  constructor(public options: SessionsServiceOptions) {
    super({
      ...options,
      dbname: 'sessions',
      indexes: [
        { fieldName: 'token', unique: true },
        { fieldName: 'userId' },
      ],
    })
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
