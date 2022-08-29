const {buildSchema, coerceInputValue, inspect} = require('graphql');

module.exports = (schemaDoc, resolverDef, server) => {
  const schema = buildSchema(schemaDoc);

  return {
    async find( params ) {
      const {query, ...context} = params;
      const {data, errors} = await server.executeOperation(query, { context });
      return {data, errors};
    },

    getSchema() {
      return schema;
    },
    getType(typeName) {
      return schema.getType(typeName);
    },

    validate(value, typeName) {
      const type = schema.getType(typeName);
      const errors = [];

      function onError(path, invalidValue, error) {
        let errorPrefix = 'Invalid value ' + JSON.stringify(invalidValue);

        if (path.length > 0) {
          errorPrefix += ' at \'value.'.concat(path.join('.'), '\'');
        }

        errors.push(errorPrefix + ': ' + error.message);
      }
      coerceInputValue(value, type, onError);
      return errors;
    }

  };
};
