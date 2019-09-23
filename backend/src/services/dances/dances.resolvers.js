module.exports = (app) => {
  const service = app.service('dances');
  const commonParams = {
    provider: 'graphql'
  };

  return {
    Dance: {
      deleted: (obj) => !!obj.deleted
    },
    Query: {
      dances: () => service.find(commonParams),
    },
    Mutation: {
      createDance: (_, {dance}) => service.create(dance, commonParams),
      modifyDance: (_, {id, dance}) => service.update(id, dance, commonParams),
      deleteDance: (_, {id}) => service.remove(id, {}, commonParams)
        .then(dance => ({...dance, deleted: true}))
    }
  };
};
