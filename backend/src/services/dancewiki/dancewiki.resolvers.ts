import { Application } from "../../declarations"
import { DancewikiParams } from "./dancewiki.class"

export default (app: Application) => {
  const service = app.service('dancewiki')

  return {
    Query: {
      searchWikiTitles: async (_: any, {search}: { search: string }) => {
        const entries = await service.find({ query: { $select: ['name'], status: { $ne: 'NOT_FOUND' } } })
        const names = entries.map(entry => entry.name)

        if (!search) return names
        const searchLower = search.toLowerCase()
        return names.filter(name => name.toLowerCase().includes(searchLower))
      },
      searchWiki: async (_: any, {search}: { search: string }) => {
        const entries = await service.find({ query: { status: { $ne: 'NOT_FOUND' } } })

        entries.sort((a, b) => a.spamScore - b.spamScore)
        if (!search) return entries
        const searchLower = search.toLowerCase()
        return entries.filter(entry => entry.name.toLowerCase().includes(searchLower))
      },
    },
    Mutation: {
      fetchWikipage: (_: any, {name}: any, params: DancewikiParams | undefined) => service.create({name}, params),
    }
  }
}
