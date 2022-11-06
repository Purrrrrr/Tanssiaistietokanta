// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const L = require('partial.lenses')
const { applyPatch } = require('fast-json-patch')

module.exports = function () {
  return async function mergeEventPatch (context) {

    if (context.data.program) {
      const {program} = context.data
      const eventService = context.app.service('events')
      const event = await eventService.get(context.id)
      const originalProgram = toProgramInput(event.program ?? {})
      console.dir(originalProgram, {depth: 999})
      console.dir(program, {depth: 999})

      context.data.program = {
        introductions: patch(originalProgram.introductions, program.introductions),
        danceSets: patch(originalProgram.danceSets, program.danceSets),
      }

      console.dir(context.data.program, {depth: 999})
    }

    throw new Error('?')
    //return context
  }

  function patch(original, patch) {
    return applyPatch(original, patch ?? [], true, false).newDocument
  }

  function toProgramInput({introductions = [], danceSets = [], slideStyleId}) {
    return {
      introductions: introductions.map(toProgramItemInput),
      danceSets: L.modify(
        [L.elems, 'program', L.elems], toProgramItemInput, danceSets
      ),
      slideStyleId,
    }
  }

  function toProgramItemInput({_id, slideStyleId, __typename, ...item}) {
    const commonProps = {_id, slideStyleId, type: __typename}
    switch(__typename) {
      case 'Dance':
        return {
          ...commonProps,
          dance: { danceId: item._id}
        }
      case 'RequestedDance':
        return {
          ...commonProps,
          requestedDance: {}
        }
      case 'EventProgram':
      {
        const {eventProgramId} = item
        return {
          ...commonProps,
          eventProgram: { eventProgramId }
        }
      }
      default:
        throw new Error('Unexpected program item type '+__typename)
    }
  }
}
