module.exports = (app) => {
  const workshopService = app.service('workshops');

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
    EventProgramItem: {
      __resolveType: (obj) => obj.__typename,
    },
    ProgramItem: {
      __resolveType: (obj) => obj.__typename,
    },
    Query: {
      events: () => service.find(commonParams),
      event: (_, {id}) => service.get(id, commonParams),
    },
    Mutation: {
      createEvent: (_, {event}) => service.create(event, commonParams),
      modifyEvent: (_, {id, event}) => service.update(id, event, commonParams),
      modifyEventProgram: (_, {id, program}) => service.patch(id, {program}, commonParams),
      deleteEvent: (_, {id}) => service.remove(id, {}, commonParams)
        .then(event => ({...event, deleted: true}))
    }
  };
};
