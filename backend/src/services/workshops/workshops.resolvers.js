module.exports = (app) => {
  const eventService = app.service('events');
  const danceService = app.service('dances');
  function getDance(id) {
    return id ? danceService.get(id) : null;
  }
  const service = app.service('workshops');
  const commonParams = {
    provider: 'graphql'
  };

  return {
    Workshop: {
      deleted: (obj) => !!obj.deleted,
      dances: (obj) => obj.danceIds.map(getDance),
      event: (obj) => eventService.get(obj.eventId)
    },
    Query: {
      workshop: (_, {id}) => service.get(id, commonParams),
    },
    Mutation: {
      createWorkshop: (_, {eventId, workshop}) => service.create({eventId, ...workshop}, commonParams),
      modifyWorkshop: (_, {id, workshop}) => service.patch(id, workshop, commonParams),
      deleteWorkshop: (_, {id}) => service.remove(id, {}, commonParams)
        .then(workshop => ({...workshop, deleted: true}))
    }
  };
};
