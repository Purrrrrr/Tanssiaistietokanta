const {graphql, buildSchema, isValidJSValue} = require('graphql');

module.exports = (schemaDoc, resolverDef, app) => {
  const schema = buildSchema(schemaDoc);
  const {Query = {}, Mutation = {}, resolverRest} = resolverDef;
  const resolvers = {...resolverRest, ...Query, ...Mutation};

  return {
    async find( params ) {
      const {query: {query, variables}} = params
      return await graphql(schema, query, resolvers, {app}, variables);
    },

    validate(value, typeName) {
      return isValidJSValue(value, schema.getType(typeName));
    }
  };
};
