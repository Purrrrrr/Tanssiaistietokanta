module.exports = (app) => {
  const eventService = app.service('events');
  const danceService = app.service('dances');
  function getDance(id) {
    return id ? danceService.get(id) : null;
  }
  const service = app.service('workshops');

  return {
    Workshop: {
      dances: (obj) => obj.danceIds.map(getDance),
      event: (obj) => eventService.get(obj.eventId)
    },
    Query: {
      workshop: (_, {id}, params) => service.get(id, params),
    },
    Mutation: {
      createWorkshop: (_, {eventId, workshop}, params) => service.create({eventId, ...workshop}, params),
      modifyWorkshop: (_, {id, workshop}, params) => service.patch(id, workshop, params),
      deleteWorkshop: (_, {id}, params) => service.remove(id, {}, params)
    }
  };
};
