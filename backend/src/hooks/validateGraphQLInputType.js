module.exports = function (typeName) {
  return context => {
    if (context.params.provider === 'graphql') {
      //Should already be valid. Skip
      return;
    }

    const graphql = context.app.service('graphql');

    const errors = graphql.validate(context.data, typeName);
    if (errors.length) {
      context.statusCode = 400;
      context.result = {
        className: 'validation-error',
        errors
      };
    }
  };
};
