import { Application } from "../../declarations"
import { UsersParams } from "./users.class"

export default (app: Application) => {
  const service = app.service('users')

  return {
    Query: {
      users: (_: any, __: any, params: UsersParams | undefined) => service.find(params),
      user: (_: any, {id}: any, params: UsersParams | undefined) => service.get(id, params),
    }
  }
}
