// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers'

import type { Application } from '../../declarations'
import type { User, UserData, UserPatch, UserQuery } from './users.schema'
import { NeDBService } from '../../utils/NeDBService'

export type { User, UserData, UserPatch, UserQuery }

export interface UserServiceOptions {
  app: Application
}

export interface UserParams extends Params<UserQuery> {}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class UserService<ServiceParams extends UserParams = UserParams>
  extends NeDBService<User, UserData, ServiceParams, UserPatch>
{
  constructor(public options: UserServiceOptions) {
    super({ ...options, dbname: 'users' })
  }

  get id() {
    return '_id'
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
