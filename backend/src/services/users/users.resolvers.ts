import { Application, Resolvers } from '../../declarations'
import { UserParams } from './users.class'

export default (app: Application): Resolvers => {
  const service = app.service('users')

  return {
    Query: {
      users: (_: any, __: any, params: UserParams | undefined) => service.find(params),
      user: (_: any, { id }: any, params: UserParams | undefined) => service.get(id, params),
    },
  }
}
