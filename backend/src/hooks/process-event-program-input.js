// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const L = require('partial.lenses');
const evolve = require('../utils/evolveObjAsync');

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const eventProgramService = context.app.service('event-program');

    context.data = await evolve({
      program: {
        danceSets: L.modifyAsync(
          [L.elems, 'program', L.elems],
          item => processProgramItem(item, eventProgramService)
        ),
        introductions: L.modifyAsync(
          L.elems,
          item => processProgramItem({ type: 'EVENT_PROGRAM', ...item }, eventProgramService),
        )
      }
    }, context.data);

    return context;
  };
};

async function processProgramItem({_id, type, danceId, eventProgramId, eventProgram, slideStyleId}, eventProgramService) {
  switch(type) {
    case 'DANCE':
    case 'REQUESTED_DANCE':
      if (!danceId) return { _id, slideStyleId, ...REQUESTED_DANCE };
      return {
        _id, danceId, slideStyleId, __typename: 'Dance'
      };
    case 'EVENT_PROGRAM':
    {
      const id = await storeProgram(eventProgramId, eventProgram, eventProgramService);
      return {
        _id, eventProgramId: id, slideStyleId, __typename: 'EventProgram'
      };
    }
  }
}

async function storeProgram(eventProgramId, eventProgram, eventProgramService) {
  if (eventProgramId) {
    await eventProgramService.update(eventProgramId, eventProgram);
    return eventProgramId;
  } else {
    const { _id } = await eventProgramService.create(eventProgram);
    return _id;
  }
}

const REQUESTED_DANCE = {
  __typename: 'RequestedDance',
};
