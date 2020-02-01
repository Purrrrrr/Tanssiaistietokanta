// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const {data: {program}} = context;

    if (program && program.danceSets) {
      context.data.program.danceSets = 
        program.danceSets.map(({program, ...danceSet}) => ({
          ...danceSet,
          program: program.map(processProgramItem)
        }));
    }

    return context;
  };
};

function processProgramItem({type, danceId, otherProgram}) {
  switch(type) {
    case 'DANCE':
      if (!danceId) return REQUESTED_DANCE;
      return {
        danceId, __typename: 'Dance'
      };
    case 'OTHER_PROGRAM':
      return {
        ...otherProgram, __typename: 'OtherProgram'
      };
    case 'REQUESTED_DANCE':
      return REQUESTED_DANCE;
  }
}

const REQUESTED_DANCE = {
  __typename: 'RequestedDance',
};
