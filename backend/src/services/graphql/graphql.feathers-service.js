const {graphql, buildSchema, isValidJSValue} = require('graphql');

module.exports = (schemaDoc, resolverDef, app) => {
  const schema = buildSchema(schemaDoc);
  const {Query = {}, Mutation = {}, resolverRest} = resolverDef;
  const resolvers = {...resolverRest, ...Query, ...Mutation};

  return {
    async find(params) {
      return await graphql(schema, params.query, resolvers, {app}, params.variables);
    },

    validate(value, typeName) {
      return isValidJSValue(value, schema.getType(typeName));
    }
  };
};
