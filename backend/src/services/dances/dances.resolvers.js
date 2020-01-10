module.exports = (app) => {
  const service = app.service('dances');
  const workshopService = app.service('workshops');
  const commonParams = {
    provider: 'graphql'
  };

  return {
    Dance: {
      deleted: (obj) => !!obj.deleted,
      teachedIn: (obj, {eventId}) => workshopService.find({
        query: eventId ?
          {danceIds: obj._id, eventId} :
          {danceIds: obj._id}
      })
    },
    Query: {
      dances: () => service.find(commonParams),
    },
    Mutation: {
      createDance: (_, {dance}) => service.create(dance, commonParams),
      modifyDance: (_, {id, dance}) => service.update(id, dance, commonParams),
      patchDance: (_, {id, dance}) => service.patch(id, dance, commonParams),
      deleteDance: (_, {id}) => service.remove(id, {}, commonParams)
        .then(dance => ({...dance, deleted: true}))
    }
  };
};
