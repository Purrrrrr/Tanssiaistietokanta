const {ForbiddenError} = require('apollo-server-express')
const {isUsedBySomething} = require('../utils/dependencies')

module.exports = function () {
  return function preventRemovingOfUsedItems(context) {
    const {id, path} = context
    if (isUsedBySomething(path, id)) {
      if (context.params.provider === 'graphql') {
        throw new ForbiddenError('The item you tried to delete is still in use', {
          errorCode: 'item-is-in-use'
        })
      }
      context.statusCode = 409
      context.result = {
        errorCode: 'item-is-in-use'
      }
    }
  }
}
