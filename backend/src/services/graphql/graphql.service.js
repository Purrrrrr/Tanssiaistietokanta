// Initializes the `graphql` service on path `/graphql`
const { ApolloServer } = require('apollo-server-express');
const { graphql } = require('graphql');
const schema = require('./graphql.schema');
const getResolvers = require('./graphql.resolvers');
const createService = require('./graphql.feathers-service');
const logger = require('../../logger');
const hooks = require('./graphql.hooks');
const {buildSchema} = require('graphql');

module.exports = function (app) {
  const resolvers = getResolvers(app);
  const context = () => ({ app });

  const server = new ApolloServer({ typeDefs: schema, resolvers, context});
  server.applyMiddleware({ app });

  // Initialize our service with any options it requires
  app.use('/graphql', createService(schema, resolvers, app));
  app.use('/graphql-schema', {
    async find() {
      return schema;
    }
  }, (req, res, next) => {
    const {data} = res;
    res.format({
      'text/plain': () => res.send(data),
      'text/html': () => res.send('<pre>'+data+'</pre>'),
    });
  });

  // Get our initialized service so that we can register hooks
  const service = app.service('graphql');

  /* Example for internal service usage
  service.find({query: '{dances {_id}}'})
    .then(
      res => logger.warn(JSON.stringify(res)),
      err => logger.warn('???' + JSON.stringify(err.message))
    );
  // */

  service.hooks(hooks);
};
