// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const L = require('partial.lenses');
const evolve = require('../utils/evolveObjAsync');

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const danceService = context.app.service('dances');
    const eventProgramService = context.app.service('event-program');

    const loadData = evolve({
      program: {
        introductions: L.modifyAsync(L.elems, addEventProgramData),
        danceSets: L.modifyAsync(
          [L.elems, 'program', L.elems],
          getProgramItemData,
        ),
      }
    })

    async function getProgramItemData(item) {
      switch(item.__typename) {
        case 'Dance':
          return await addDanceData(item);
        case 'EventProgram':
          return await addEventProgramData(item);
        default:
          return item
      }
    }

    async function addDanceData({danceId}) {
      const dance = await getDance(danceId);
      if (!dance) return {__typename: 'RequestedDance'};
      return {...dance, __typename: 'Dance'};
    }

    async function getDance(id) {
      return id ? await danceService.get(id) : null;
    }

    async function addEventProgramData({eventProgramId}) {
      const program = await eventProgramService.get(eventProgramId);
      if (!program) return item;
      return {...program, __typename: 'EventProgram'};
    }

    if (Array.isArray(context.result)) {
      context.result = Promise.all(context.result.map(loadData));
    } else if (context.result) {
      context.result = await loadData(context.result);
    }

    return context;
  };
};
