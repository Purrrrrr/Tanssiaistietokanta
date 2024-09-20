import * as L from 'partial.lenses'
import { Application } from "../../declarations"
import { EventsParams } from './events.class'

export default (app: Application) => {
  const workshopService = app.service('workshops')
  const danceService = app.service('dances')

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
      versions: ({_id}: {_id: string}) => service.find({
        query: {
          $sort,
          _id,
          searchVersions: true,
        }
      })
    },
    DanceSet: {
      program: (obj: { program: any }) => L.modifyAsync(L.elems, getProgramItemData, obj.program),
    },
    Introductions: {
      program: (obj: { program: any }) => L.modifyAsync(L.elems, getProgramItemData, obj.program),
    },
    EventProgramItem: {
      __resolveType: (obj: { __typename: any }) => obj.__typename
    },
    ProgramItem: {
      __resolveType: (obj: { __typename: any }) => obj.__typename
    },
    Query: {
      events: (_: any, __: any, params: EventsParams | undefined) => service.find({...params, query: { $sort } }),
      event: (_: any, {id, versionId}: any, params: EventsParams | undefined) => versionId
        ? service.getVersion(id, versionId, params)
        : service.get(id, params)
    },
    Mutation: {
      createEvent: (_: any, {event}: any, params: EventsParams | undefined) => service.create(event, params),
      modifyEvent: (_: any, {id, event}: any, params: EventsParams | undefined) => service.update(id, event, params),
      patchEvent: (_: any, {id, event}: any, params: EventsParams | undefined) => service.patch(id, event, params),
      modifyEventProgram: async (_: any, {id, program}: any, params: EventsParams | undefined) => {
        const event = await service.get(id)
        return service.update(id, { ...event, program}, params)
      },
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

  async function getProgramItemData(item: any) {
    switch(item.type) {
      case 'Dance':
      case 'RequestedDance':
        return await addDanceData(item)
      case 'EventProgram':
        return await addEventProgramData(item)
      default:
        throw new Error('unknown type name '+item.__typename)
    }
  }

  async function addDanceData({dance: danceId, ...rest}: any) {
    const dance = await getDance(danceId) ?? {_id: null}
    const __typename = dance._id ? 'Dance' : 'RequestedDance'
    return {item: {__typename, ...dance}, ...rest}
  }

  async function getDance(id: string) {
    return id ? await danceService.get(id).catch(() => null) : null
  }

  async function addEventProgramData({eventProgram, type: __typename, ...rest}: any) {
    return {item: {...eventProgram, __typename}, ...rest}
  }
}
