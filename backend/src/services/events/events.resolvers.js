module.exports = (app) => {
  const service = app.service('events');
  const commonParams = {
    provider: 'graphql'
  };

  return {
    Query: {
      events: () => service.find(commonParams)
    }
  };
};
