const {buildSchema, isValidJSValue} = require('graphql');

module.exports = (schemaDoc, resolverDef, server) => {
  const schema = buildSchema(schemaDoc);

  return {
    async find( params ) {
      const {query, ...context} = params;
      const {data, errors} = await server.executeOperation(query, { context });
      return {data, errors};
    },

    validate(value, typeName) {
      return isValidJSValue(value, schema.getType(typeName));
    }
  };
};
