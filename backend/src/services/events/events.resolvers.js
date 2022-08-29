module.exports = (app) => {
  const workshopService = app.service('workshops');

  function getWorkshops(eventId) {
    return workshopService.find({query: {eventId}});
  }

  const service = app.service('events');

  return {
    Event: {
      workshops: (obj) => getWorkshops(obj._id),
    },
    EventProgramItem: {
      __resolveType: (obj) => obj.__typename,
    },
    ProgramItem: {
      __resolveType: (obj) => obj.__typename,
    },
    Query: {
      events: (_, __, params) => service.find(params),
      event: (_, {id}, params) => service.get(id, params),
    },
    Mutation: {
      createEvent: (_, {event}, params) => service.create(event, params),
      modifyEvent: (_, {id, event}, params) => service.update(id, event, params),
      modifyEventProgram: (_, {id, program}, params) => service.patch(id, {program}, params),
      deleteEvent: (_, {id}, params) => service.remove(id, {}, params)
    }
  };
};
