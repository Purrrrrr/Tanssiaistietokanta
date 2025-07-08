import { Application } from "../../declarations"
import { DancewikiParams } from "./dancewiki.class"

export default (app: Application) => {
  const service = app.service('dancewiki')

  return {
    Query: {
      searchWikiTitles: async (_: any, {search, maxSpamScore}: { search: string, maxSpamScore?: number }) => {
        let entries = await service.find({
          query: { 
            $sort: { name: 1 },
            status: { $ne: 'NOT_FOUND' }, 
            spamScore: { $lt: maxSpamScore ?? 1000000 }
          }
        })

        const names = entries.map(entry => entry.name)

        if (!search) return names
        const searchLower = search.toLowerCase()
        return names.filter(name => name.toLowerCase().includes(searchLower))
      },
      searchWiki: async (_: any, {search, maxSpamScore}: { search: string, maxSpamScore?: number }) => {
        let entries = await service.find({
          query: { 
            $sort: { name: 1 },
            status: { $ne: 'NOT_FOUND' }, 
            spamScore: { $lt: maxSpamScore ?? 1000000 }
          }
        })

        if (!search) return entries
        const searchLower = search.toLowerCase()
        return entries.filter(entry => entry.name.toLowerCase().includes(searchLower))
      },
      wikipage: async (_: any, { name }: { name: string }) => service.get(name, { noThrowOnNotFound: true })
    },
    Mutation: {
      fetchWikipage: (_: any, {name}: any, params: DancewikiParams | undefined) => service.update(name, {name}, params),
    }
  }
}
