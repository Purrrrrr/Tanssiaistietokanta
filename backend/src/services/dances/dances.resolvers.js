module.exports = (app) => {
  const service = app.service('dances');
  const commonParams = {
    provider: 'graphql'
  };

  return {
    Query: {
      dances: () => service.find(commonParams)
    }
  };
};
