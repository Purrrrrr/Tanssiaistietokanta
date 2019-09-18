const path = require('path');
const {fileLoader, mergeResolvers} = require('merge-graphql-schemas');

const resolvers = fileLoader(path.join(__dirname, '/../**/*.resolvers.js'));


module.exports = function(app) {
  function applyContext(importedResolvers) {
    if (typeof(importedResolvers) === 'function') {
      return importedResolvers(app);
    }
    return importedResolvers;
  }

  return mergeResolvers(resolvers.map(applyContext));
};
