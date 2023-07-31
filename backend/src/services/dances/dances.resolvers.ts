import { Application } from "../../declarations"
import { DancesParams } from "./dances.class"
import { getDependencyLinks } from '../../utils/dependencies'

import type { Dances } from './dances.schema'
import type { Events } from '../events/events.schema'

export default (app: Application) => {
  const service = app.service('dances')
  const workshopService = app.service('workshops')
  const eventService = app.service('events')

  function findTeachedIn(obj: { _id: string}, {eventId}: { eventId: string}) {
    return workshopService.find({
      query: eventId ?
        {danceIds: obj._id, eventId} :
        {danceIds: obj._id}
    })
  }

  async function findEvents(obj: Dances): Promise<Events[]> {
    const links = getDependencyLinks('dances', obj._id, 'usedBy')

    const workshopIds = Array.from(links.get('workshops') ?? [])
    const workshops = await Promise.all(workshopIds.map(id => workshopService.get(id, {query: { $select: ['eventId']}})))
    const ids = [
      ...Array.from(links.get('events') ?? []) as string[],
      ...workshops.map(workshop => workshop.eventId)
    ]

    return eventService.find({query: {_id: {$in: ids}}})
  }

  return {
    Dance: {
      teachedIn: findTeachedIn,
      events: findEvents,
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
