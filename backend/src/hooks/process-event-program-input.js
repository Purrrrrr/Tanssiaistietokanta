// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const L = require('partial.lenses')
const evolve = require('../utils/evolveObjAsync')

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const eventProgramService = context.app.service('event-program')

    context.data = await evolve({
      program: {
        danceSets: L.modifyAsync(
          [L.elems, 'program', L.elems],
          item => processProgramItem(item, eventProgramService)
        ),
        introductions: L.modifyAsync(
          L.elems,
          item => processProgramItem({ type: 'EVENT_PROGRAM', ...item }, eventProgramService)
        )
      }
    }, context.data)

    return context
  }
}

async function processProgramItem(item, eventProgramService) {
  const {_id, type, slideStyleId, ...rest} = item
  const commonProps = {
    _id, __typename: type, slideStyleId
  }
  switch(type) {
    case 'Dance':
    case 'RequestedDance':
    {
      const {danceId} = getParameters(rest, type)
      const __typename = danceId ? type : 'RequestedDance'
      return {
        ...commonProps, danceId, __typename
      }
    }
    case 'EventProgram':
    {
      const {eventProgramId, eventProgram} = getParameters(rest, type)
      const id = await storeProgram(eventProgramId, eventProgram, eventProgramService)
      return {
        ...commonProps, eventProgramId: id
      }
    }
  }
}

function getParameters(input, type) {
  const prop = type[0].toLowerCase() + type.slice(1)
  return input[prop]
}

async function storeProgram(eventProgramId, eventProgram, eventProgramService) {
  if (eventProgramId) {
    await eventProgramService.update(eventProgramId, eventProgram)
    return eventProgramId
  } else {
    const { _id } = await eventProgramService.create(eventProgram)
    return _id
  }
}
