import { Application } from "../../declarations"
import { DancesParams } from "./dances.class"

export default (app: Application) => {
  const service = app.service('dances')
  const workshopService = app.service('workshops')

  function findTeachedIn(obj: { _id: string}, {eventId}: { eventId: string}) {
    return workshopService.find({
      query: eventId ?
        {danceIds: obj._id, eventId} :
        {danceIds: obj._id}
    })
  }

  return {
    Dance: {
      teachedIn: findTeachedIn,
    },
    Query: {
      dance: (_: any, {id}: any, params: DancesParams | undefined) => service.get(id, params),
      dances: (_: any, __: any, params: DancesParams | undefined) => service.find(params),
    },
    Mutation: {
      createDance: (_: any, {dance}: any, params: DancesParams | undefined) => service.create(dance, params),
      modifyDance: (_: any, {id, dance}: any, params: DancesParams | undefined) => service.update(id, dance, params),
      patchDance: (_: any, {id, dance}: any, params: DancesParams | undefined) => service.patch(id, dance, params),
      deleteDance: (_: any, {id}: any, params: DancesParams | undefined) => service.remove(id, params),
    }
  }
}
