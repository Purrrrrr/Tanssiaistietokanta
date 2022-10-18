// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const L = require('partial.lenses')
const evolve = require('../utils/evolveObjAsync')

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const danceService = context.app.service('dances')
    const eventProgramService = context.app.service('event-program')

    const loadData = evolve({
      program: {
        introductions: L.modifyAsync(L.elems, addEventProgramData),
        danceSets: L.modifyAsync(
          [L.elems, 'program', L.elems],
          getProgramItemData
        )
      }
    })

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
      const dance = await getDance(danceId) || {__typename: 'RequestedDance'}
      return {item: {...dance, __typename}, ...rest}
    }

    async function getDance(id) {
      return id ? await danceService.get(id) : null
    }

    async function addEventProgramData({eventProgramId, __typename, ...rest}) {
      const program = await eventProgramService.get(eventProgramId)
      return {item: {...program, __typename}, ...rest}
    }

    if (Array.isArray(context.result)) {
      context.result = await Promise.all(context.result.map(loadData))
    } else if (context.result) {
      context.result = await loadData(context.result)
    }
    //console.dir(context.result, {depth: 100})

    return context
  }
}
