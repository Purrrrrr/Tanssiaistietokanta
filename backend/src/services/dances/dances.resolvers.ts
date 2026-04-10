import { Application, Resolvers } from '../../declarations'
import { getDependencyLinks } from '../../internal-services/dependencies'

import type { Dances } from './dances.schema'
import type { Events } from '../events/events.schema'
import { uniq } from 'ramda'
import { WorkshopsService } from '../workshops/workshops.class'
import { DancewikiService } from '../dancewiki/dancewiki.class'
import { SkipAccessControl } from '../access/hooks'
import { removeNulls } from '../../utils/common-types'

export async function findTeachedIn(workshopService: WorkshopsService, danceId: string, eventId?: string | null) {
  const workshops = await workshopService.find({
    query: eventId ?
      { 'instances.danceIds': danceId, eventId } :
      { 'instances.danceIds': danceId },
  })

  return workshops.map(workshop => {
    const instancesWithDance = workshop.instanceSpecificDances
      ? workshop.instances.filter(instance => instance.danceIds?.includes(danceId))
      : null
    const danceInAllInstances = instancesWithDance?.length === workshop.instances.length

    return {
      _id: `${danceId}-${workshop._id}`,
      workshop,
      instances: danceInAllInstances ? null : instancesWithDance,
    }
  })
}

export function findWikipage(wikiService: DancewikiService, dance: Dances) {
  const name = dance.wikipageName ?? dance.name
  if (!name) return null
  return wikiService.get(name, { noThrowOnNotFound: true })
}

export default (app: Application): Resolvers => {
  const service = app.service('dances')
  const workshopService = app.service('workshops')
  const eventService = app.service('events')
  const wikiService = app.service('dancewiki')

  async function findEvents(obj: Dances): Promise<Events[]> {
    const links = getDependencyLinks('dances', obj._id, 'usedBy')

    const workshopIds = Array.from(links.get('workshops') ?? [])
    const workshops = await workshopService.find({ [SkipAccessControl]: true, query: { _id: { $in: workshopIds as string[] }, $select: ['eventId'] } })
    const ids = [
      ...Array.from(links.get('events') ?? []) as string[],
      ...workshops.map(workshop => workshop.eventId),
    ]

    return eventService.find({ query: { _id: { $in: ids }, $sort: { beginDate: 1 } } })
  }

  return {
    Dance: {
      teachedIn: (dance, { eventId }) =>
        findTeachedIn(workshopService, dance._id, eventId),
      events: findEvents,
      wikipage: (dance) => findWikipage(wikiService, dance),
    },
    Query: {
      dance: (_, { id, versionId }, params) => versionId
        ? service.get(id, { ...params, query: { _versionId: versionId } })
        : service.get(id, params),
      dances: (_, __, params) => service.find(params),
      danceCategories: async (_, __, params) =>
        uniq((await service.find(params)).map(dance => dance.category)).filter(Boolean).sort(),
    },
    Mutation: {
      createDance: (_, { dance }, params) => service.create(dance, params),
      patchDance: (_, { id, dance }, params) => {
        const { wikipageName, ...rest } = dance
        return service.patch(id, { wikipageName, ...removeNulls(rest) }, params)
      },
      deleteDance: (_, { id }, params) => service.remove(id, params),
    },
  }
}
