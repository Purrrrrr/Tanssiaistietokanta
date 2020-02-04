// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const L = require('partial.lenses');
const R = require('ramda');

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const danceService = context.app.service('dances');
    async function getDance(id) {
      return id ? await danceService.get(id) : null;
    }

    async function addProgramData(event) {
      if (!event.program) return event;
      return L.modifyAsync(
        ['program', 'danceSets', L.elems, 'program', L.elems, L.when(R.propEq('__typename', 'Dance'))],
        addDanceData,
        event
      );
    }

    async function addDanceData({danceId}) {
      const dance = await getDance(danceId);
      if (!dance) return {__typename: 'RequestedDance'};
      return {...dance, __typename: 'Dance'};
    }

    if (Array.isArray(context.result)) {
      context.result = Promise.all(context.result.map(addProgramData));
    } else if (context.result) {
      context.result = await addProgramData(context.result);
    }

    return context;
  };
};
