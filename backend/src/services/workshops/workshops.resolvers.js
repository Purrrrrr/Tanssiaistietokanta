module.exports = (app) => {
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
      dances: (obj) => obj.danceIds.map(getDance)
    },
    Query: {
      workshops: () => service.find(commonParams),
    },
    Mutation: {
      createWorkshop: ({workshop}) => service.create(workshop, commonParams),
      modifyWorkshop: (_, {id, workshop}) => service.update(id, workshop, commonParams),
      deleteWorkshop: (_, {id}) => service.remove(id, {}, commonParams)
        .then(workshop => ({...workshop, deleted: true}))
    }
  };
};
