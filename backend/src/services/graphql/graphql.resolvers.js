const { loadFilesSync } = require('@graphql-tools/load-files')
const { mergeResolvers } = require('@graphql-tools/merge')

const resolvers = loadFilesSync(`${__dirname}/../**/*.resolvers.js`)

module.exports = function(app) {
  function applyContext(importedResolvers) {
    if (typeof(importedResolvers) === 'function') {
      return importedResolvers(app)
    }
    return importedResolvers
  }

  return mergeResolvers(resolvers.map(applyContext))
}
