// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const { applyPatch } = require('fast-json-patch')

module.exports = function () {
  return async function mergeEventPatch (context) {
    if (context.data.program) {
      const {program} = context.data
      const eventService = context.app.service('events')
      const eventInDB = await eventService.get(context.id)

      context.data.program = patch(eventInDB.program, program)
    }
  }

  function patch(original, patch) {
    return applyPatch(original, patch ?? [], true, false).newDocument
  }
}
