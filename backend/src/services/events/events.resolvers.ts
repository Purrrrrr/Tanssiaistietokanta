import * as L from 'partial.lenses'
import { Application, Resolvers } from '../../declarations'
import { JSONPatch } from '../../hooks/merge-json-patch'
import { toSelect } from '../../utils/resolvers'
import { eventsSchema } from './events.schema'

export default (app: Application): Resolvers => {
  const workshopService = app.service('workshops')
  const service = app.service('events')

  const $sort = { beginDate: -1, name: 1 }

  return {
    Event: {
      workshops: (event) => workshopService.find({ query: { eventId: event._id } }),
      program: (event) => {
        const { program } = event
        if (!program.introductions.title) return L.set(['introductions', 'title'], event.name, program)
        return program
      },
    },
    EventVolunteerAssignment: {
      event: (assignment, _, __, info) =>
        service.get(assignment.eventId, { query: { $select: toSelect(info, eventsSchema) } }),
    },
    Workshop: {
      event: (workshop, _, __, info) => service.get(workshop.eventId, { query: { $select: toSelect(info, eventsSchema) } }),
    },
    Query: {
      events: (_, __, params) => service.find({ ...params, query: { $sort } }),
      event: (_, { id, versionId }, params) => versionId
        ? service.get(id, { ...params, query: { _versionId: versionId } })
        : service.get(id, params),
    },
    Mutation: {
      createEvent: (_, { event }, params) => service.create(event, params),
      patchEvent: (_, { id, event }, params) =>
        service.patch(id, event as JSONPatch, { ...params, jsonPatch: true }),
      patchEventProgram: async (_, { id, program }, params) => {
        const data = (program as JSONPatch).map(({ path, ...rest }) => {
          const line = { ...rest, path: '/program' + path }
          if ('from' in line) {
            line.from = '/program' + line.from
          }
          return line
        })
        return service.patch(id, data, { ...params, jsonPatch: true })
      },
      deleteEvent: (_, { id }, params) => service.remove(id, params),
    },
  }
}
