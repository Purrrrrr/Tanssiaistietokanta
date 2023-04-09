const {ValidationError} = require('apollo-server-express')

module.exports = function (typeName) {
  return context => {
    const { provider } = context.params
    if (provider === 'graphql' || provider === 'migration') {
      //Should already be valid. Skip
      return
    }

    const graphql = context.app.service('graphql')

    const errors = graphql.validate(context.data, typeName)
    if (errors.length) {
      context.statusCode = 400
      throw new ValidationError(errors.join('\n'), {
        errorCode: 'validation-error'
      })
    }
  }
}
