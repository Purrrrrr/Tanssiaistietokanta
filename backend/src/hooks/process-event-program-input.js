// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
const L = require('partial.lenses');

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    const {data: {program}} = context;

    if (program && program.danceSets) {
      context.data.program = L.modify(
        ['danceSets', L.elems, 'program', L.elems], processProgramItem,
        program
      );
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
