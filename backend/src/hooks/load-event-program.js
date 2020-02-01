// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const danceService = context.app.service('dances');
    async function getDance(id) {
      return id ? await danceService.get(id) : null;
    }

    async function addProgramData({program, ...event}) {
      if (!program) return event;
      const {danceSets, ...otherProgram} = program;
      return {
        ...event,
        program: {
          ...otherProgram,
          danceSets: await Promise.all(danceSets.map(addDanceSetData))
        }
      };
    }

    async function addDanceSetData({program, ...danceSet}) {
      return {
        program: await Promise.all(program.map(addProgramItemData)),
        ...danceSet
      };
    }

    async function addProgramItemData(item) {
      const {__typename} = item;
      switch (__typename) {
        case 'Dance': {
          const dance = await getDance(item.danceId);
          if (!dance) return {__typename: 'RequestedDance'};
          return {...dance, __typename};
        }
        default:
          return item;
      }
    }

    if (Array.isArray(context.result)) {
      context.result = Promise.all(context.result.map(addProgramData));
    } else if (context.result) {
      context.result = await addProgramData(context.result);
    }

    return context;
  };
};
