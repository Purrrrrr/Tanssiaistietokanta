module.exports = (app) => {
  const danceService = app.service('dances');
  function getDance(id) {
    return id ? danceService.get(id) : null;
  }
  const service = app.service('events');
  const commonParams = {
    provider: 'graphql'
  };

  return {
    Event: {
      deleted: (obj) => !!obj.deleted,
    },
    ProgramItem: {
      name: (obj) => {
        const {name} = obj.danceId ?
          getDance(obj.danceId) : obj;
        return name;
      },
      dance: (obj) => getDance(obj.danceId)
    },
    Query: {
      events: () => service.find(commonParams),
    },
    Mutation: {
      createEvent: (_, {event}) => service.create(event, commonParams),
      modifyEvent: (_, {id, event}) => service.update(id, event, commonParams),
      deleteEvent: (_, {id}) => service.remove(id, {}, commonParams)
        .then(event => ({...event, deleted: true}))
    }
  };
};
