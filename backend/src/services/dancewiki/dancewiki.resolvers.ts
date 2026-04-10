import { Application, Resolvers } from '../../declarations'

export default (app: Application): Resolvers => {
  const service = app.service('dancewiki')

  return {
    Query: {
      searchWikiTitles: async (_, { search, maxSpamScore }) => {
        const entries = await service.find({
          query: {
            $sort: { name: 1 },
            status: { $ne: 'NOT_FOUND' },
            spamScore: { $lt: maxSpamScore ?? 1000000 },
          },
        })

        const names = entries.map(entry => entry.name)

        if (!search) return names
        const searchLower = search.toLowerCase()
        return names.filter(name => name.toLowerCase().includes(searchLower))
      },
      searchWiki: async (_, { search, maxSpamScore }) => {
        const entries = await service.find({
          query: {
            $sort: { name: 1 },
            status: { $ne: 'NOT_FOUND' },
            spamScore: { $lt: maxSpamScore ?? 1000000 },
          },
        })

        if (!search) return entries
        const searchLower = search.toLowerCase()
        return entries.filter(entry => entry.name.toLowerCase().includes(searchLower))
      },
      wikipage: async (_, { name }) => service.get(name, { noThrowOnNotFound: true }),
    },
    Mutation: {
      fetchWikipage: (_, { name }, params) => service.update(name, { name }, params),
    },
  }
}
