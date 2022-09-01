// Initializes the `graphql` service on path `/graphql`
const { ApolloServer } = require('apollo-server-express');
const schema = require('./graphql.schema');
const getResolvers = require('./graphql.resolvers');
const createService = require('./graphql.feathers-service');
const hooks = require('./graphql.hooks');

module.exports = function (app) {
  const resolvers = getResolvers(app);
  const context = ({
    req = {headers: {}},
    context = {}
  }) => ({
    headers: req.headers,
    ...context,
    provider: 'graphql',
  });

  const server = new ApolloServer({ typeDefs: schema, resolvers, context});
  server.start().then(() => server.applyMiddleware({ app }));

  // Initialize our service with any options it requires
  app.use('/graphql', createService(schema, resolvers, server));
  app.use('/graphql-schema', {
    async find() {
      return schema;
    }
  }, (req, res) => {
    const {data} = res;
    res.format({
      'text/plain': () => res.send(data),
      'text/html': () => res.send('<pre>'+data+'</pre>'),
    });
  });

  // Get our initialized service so that we can register hooks
  const service = app.service('graphql');

  /* Example for internal service usage
  service.find({query: {query: '{dances {_id}}'}})
    .then(
      res => logger.warn(JSON.stringify(res)),
      err => logger.warn('???' + JSON.stringify(err.message))
    );
  // */

  service.hooks(hooks);
};
