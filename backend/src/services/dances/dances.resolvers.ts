import { Application } from "../../declarations"
import { DancesParams } from "./dances.class"
import { getDependencyLinks } from '../../utils/dependencies'

import type { Dances } from './dances.schema'
import type { Events } from '../events/events.schema'
import { versionHistoryFieldResolvers, versionHistoryResolver } from '../../utils/version-history-resolvers'
import { uniq } from "ramda"

export default (app: Application) => {
  const service = app.service('dances')
  const workshopService = app.service('workshops')
  const eventService = app.service('events')
  const wikiService = app.service('dancewiki')

  async function findTeachedIn(dance: { _id: string}, {eventId}: { eventId: string}) {
    const workshops = await workshopService.find({
      query: eventId ?
        {'instances.danceIds': dance._id, eventId} :
        {'instances.danceIds': dance._id}
    })

    return workshops.map(workshop => {
      const instancesWithDance = workshop.instanceSpecificDances
        ? workshop.instances.filter(instance => instance.danceIds?.includes(dance._id))
        : null
      const danceInAllInstances = instancesWithDance?.length === workshop.instances.length

      return {
        _id: `${dance._id}-${workshop._id}`,
        workshop,
        instances: danceInAllInstances ? null : instancesWithDance
      }
    })
  }

  async function findEvents(obj: Dances): Promise<Events[]> {
    const links = getDependencyLinks('dances', obj._id, 'usedBy')

    const workshopIds = Array.from(links.get('workshops') ?? [])
    const workshops = await Promise.all(
      workshopIds.map(id => workshopService.get(id, {query: { $select: ['eventId']}}))
    )
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
      versionHistory: versionHistoryResolver(service),
      wikipage: (dance: Dances) => {
        const name = dance.wikipageName ?? dance.name
        if (!name) return null
        return wikiService.get(name, { noThrowOnNotFound: true })
      }
    },
    VersionHistory: versionHistoryFieldResolvers(),
    Query: {
      dance: (_: any, {id, versionId}: any, params: DancesParams | undefined) => versionId
        ? service.getVersion(id, versionId, params)
        : service.get(id, params),
      dances: (_: any, __: any, params: DancesParams | undefined) => service.find(params),
      danceCategories: async (_: any, __: any, params: DancesParams | undefined) => 
        uniq((await service.find(params)).map(dance => dance.category)).filter(Boolean).sort(),
    },
    Mutation: {
      createDance: (_: any, {dance}: any, params: DancesParams | undefined) => service.create(dance, params),
      modifyDance: (_: any, {id, dance}: any, params: DancesParams | undefined) => service.update(id, dance, params),
      patchDance: (_: any, {id, dance}: any, params: DancesParams | undefined) => service.patch(id, dance, params),
      deleteDance: (_: any, {id}: any, params: DancesParams | undefined) => service.remove(id, params),
    }
  }
}
