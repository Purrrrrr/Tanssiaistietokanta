module.exports = (app) => {
  const danceService = app.service('dances');
  const workshopService = app.service('workshops');

  function getDance(id) {
    return id ? danceService.get(id) : null;
  }
  function getWorkshops(eventId) {
    return workshopService.find({query: {eventId}});
  }

  const service = app.service('events');
  const commonParams = {
    provider: 'graphql'
  };

  return {
    Event: {
      deleted: (obj) => !!obj.deleted,
      workshops: (obj) => getWorkshops(obj._id),
    },
    ProgramItem: {
      name: async ({name, danceId}) => {
        if (danceId) {
          const dance = await getDance(danceId);
          return dance.name;
        }
        return name;
      },
      dance: (obj) => getDance(obj.danceId)
    },
    Query: {
      events: () => service.find(commonParams),
      event: (_, {id}) => service.get(id, commonParams),
    },
    Mutation: {
      createEvent: (_, {event}) => service.create(event, commonParams),
      modifyEvent: (_, {id, event}) => service.update(id, event, commonParams),
      deleteEvent: (_, {id}) => service.remove(id, {}, commonParams)
        .then(event => ({...event, deleted: true}))
    }
  };
};
