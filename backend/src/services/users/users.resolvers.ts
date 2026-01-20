import { Application } from "../../declarations"
import { UserParams } from "./users.class"

export default (app: Application) => {
  const service = app.service('users')

  return {
    Query: {
      users: (_: any, __: any, params: UserParams | undefined) => service.find(params),
      user: (_: any, {id}: any, params: UserParams | undefined) => service.get(id, params),
    }
  }
}
