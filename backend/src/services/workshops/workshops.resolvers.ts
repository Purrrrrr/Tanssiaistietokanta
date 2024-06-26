import { Id } from "@feathersjs/feathers/lib"
import { Application } from "../../declarations"
import { WorkshopsParams } from "./workshops.class"

export default (app: Application) => {
  const eventService = app.service('events')
  const danceService = app.service('dances')
  function getDance(id: string) {
    return id ? danceService.get(id) : null
  }
  const service = app.service('workshops')

  return {
    Workshop: {
      danceIds: (obj: { instances: {danceIds: string[] }[] }) => obj.instances.flatMap(i => i.danceIds ?? []),
      dances: (obj: { instances: {danceIds: string[] }[] }) => obj.instances.flatMap(i => i.danceIds ?? []).map(getDance),
      event: (obj: { eventId: Id }) => eventService.get(obj.eventId)
    },
    WorkshopInstance: {
      dances: (obj: { danceIds: string[] }) => obj.danceIds.map(getDance),
    },
    Query: {
      workshop: (_: any, {id}: any, params: WorkshopsParams | undefined) => service.get(id, params)
    },
    Mutation: {
      createWorkshop: (_: any, {eventId, workshop}: any, params: WorkshopsParams | undefined) => service.create({eventId, ...workshop}, params),
      modifyWorkshop: (_: any, {id, workshop}: any, params: WorkshopsParams | undefined) => service.update(id, workshop, params),
      patchWorkshop: (_: any, {id, workshop}: any, params: WorkshopsParams | undefined) => service.patch(id, workshop, params),
      deleteWorkshop: (_: any, {id}: any, params: WorkshopsParams | undefined) => service.remove(id, params)
    }
  }
}
