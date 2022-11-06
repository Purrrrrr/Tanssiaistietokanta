const L = require('partial.lenses')

module.exports = (app) => {
  const workshopService = app.service('workshops')
  const danceService = app.service('dances')
  const eventProgramService = app.service('event-program')

  function getWorkshops(eventId) {
    return workshopService.find({query: {eventId}})
  }

  const service = app.service('events')

  return {
    Event: {
      workshops: (obj) => getWorkshops(obj._id)
    },
    EventProgramSettings: {
      introductions: obj => L.modifyAsync(L.elems, addEventProgramData, obj.introductions),
      danceSets: obj => L.modifyAsync(
        [L.elems, 'program', L.elems],
        getProgramItemData,
        obj.danceSets
      )
    },
    EventProgramItem: {
      __resolveType: (obj) => obj.__typename
    },
    ProgramItem: {
      __resolveType: (obj) => obj.__typename
    },
    Query: {
      events: (_, __, params) => service.find(params),
      event: (_, {id}, params) => service.get(id, params)
    },
    Mutation: {
      createEvent: (_, {event}, params) => service.create(event, params),
      modifyEvent: (_, {id, event}, params) => service.update(id, event, params),
      modifyEventProgram: async (_, {id, program}, params) => {
        const event = await service.get(id)
        return service.update(id, { ...event, program}, params)
      },
      deleteEvent: (_, {id}, params) => service.remove(id, params)
    }
  }

  async function getProgramItemData(item) {
    switch(item.__typename) {
      case 'Dance':
      case 'RequestedDance':
        return await addDanceData(item)
      case 'EventProgram':
        return await addEventProgramData(item)
      default:
        throw new Error('unknown type name '+item.__typename)
    }
  }

  async function addDanceData({danceId, __typename, ...rest}) {
    const dance = await getDance(danceId) ?? {__typename: 'RequestedDance'}
    return {item: {...dance, __typename}, ...rest}
  }

  async function getDance(id) {
    return id ? await danceService.get(id) : null
  }

  async function addEventProgramData({eventProgramId, __typename, ...rest}) {
    const program = await eventProgramService.get(eventProgramId)
    return {item: {...program, __typename}, ...rest}
  }
}
