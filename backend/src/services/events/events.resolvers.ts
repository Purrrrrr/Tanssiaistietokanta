import * as L from 'partial.lenses'
import { Application } from "../../declarations"
import { EventsParams } from './events.class'
import { versionHistoryFieldResolvers, versionHistoryResolver } from '../../utils/version-history-resolvers'

export default (app: Application) => {
  const workshopService = app.service('workshops')

  function getWorkshops(workshopVersions: Record<string, string>) {
    const versionIds = Object.values(workshopVersions)
    return workshopService.find({query: {_versionId: { $in: versionIds }, $sort: { name: 1 }}})
  }

  const service = app.service('events')

  const $sort = { beginDate: -1, name: 1}

  return {
    Event: {
      workshops: (obj: { workshopVersions: Record<string, string> }) => getWorkshops(obj.workshopVersions),
      program: (event: { name?: any; program?: any }) => {
        const { program } = event
        if (!program.introductions.title) return L.set(['introductions', 'title'], event.name, program)
        return program
      },
      versionHistory: versionHistoryResolver(service),
    },
    VersionHistory: versionHistoryFieldResolvers(),
    Query: {
      events: (_: any, __: any, params: EventsParams | undefined) => service.find({...params, query: { $sort } }),
      event: (_: any, {id, versionId}: any, params: EventsParams | undefined) => versionId
        ? service.getVersion(id, versionId, params)
        : service.get(id, params)
    },
    Mutation: {
      createEvent: (_: any, {event}: any, params: EventsParams | undefined) => service.create(event, params),
      patchEvent: (_: any, {id, event}: any, params: EventsParams | undefined) =>
        service.patch(id, event, { ...params, jsonPatch: true }),
      patchEventProgram: async (_: any, {id, program}: any, params: EventsParams | undefined) => {
        const data = program.map(({path, ...rest}: any) => { 
          const line = {...rest, path: '/program'+path}
          if ('from' in line) {
            line.from = '/program'+line.from
          }
          return line
        })
        return service.patch(id, data, { ...params, jsonPatch: true })
      },
      deleteEvent: (_: any, {id}: any, params: EventsParams | undefined) => service.remove(id, params)
    }
  }
}
