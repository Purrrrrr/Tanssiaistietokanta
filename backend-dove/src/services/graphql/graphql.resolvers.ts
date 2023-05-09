import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeResolvers } from '@graphql-tools/merge'

const resolvers = loadFilesSync(`${__dirname}/../**/*.resolvers.js`)

export default function(app: any) {
  function applyContext(importedResolvers: any) {
    if (typeof(importedResolvers) === 'function') {
      return importedResolvers(app)
    }
    return importedResolvers
  }

  return mergeResolvers(resolvers.map(applyContext))
}
