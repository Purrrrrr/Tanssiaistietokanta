const L = require('partial.lenses')

module.exports = (app) => {
  const workshopService = app.service('workshops')
  const danceService = app.service('dances')

  function getWorkshops(eventId) {
    return workshopService.find({query: {eventId}})
  }

  const service = app.service('events')

  return {
    Event: {
      workshops: (obj) => getWorkshops(obj._id)
    },
    DanceSet: {
      program: obj => L.modifyAsync(L.elems, getProgramItemData, obj.program),
    },
    Introductions: {
      program: obj => L.modifyAsync(L.elems, getProgramItemData, obj.program),
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

  async function addDanceData({dance: danceId, ...rest}) {
    const dance = await getDance(danceId) ?? {}
    const __typename = dance._id ? 'Dance' : 'RequestedDance'
    return {item: {__typename, ...dance}, ...rest}
  }

  async function getDance(id) {
    return id ? await danceService.get(id) : null
  }

  async function addEventProgramData({eventProgram, type: __typename, ...rest}) {
    return {item: {...eventProgram, __typename}, ...rest}
  }
}
