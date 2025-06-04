import { Application } from "../../declarations"
import { DancewikiParams } from "./dancewiki.class"

export default (app: Application) => {
  const service = app.service('dancewiki')

  return {
    Query: {
      searchWiki: async (_: any, {search}: { search: string }) => {
        const entries = await service.find({ query: { $select: ['name'], status: { $ne: 'NOT_FOUND' } } })
        const names = entries.map(entry => entry.name)

        if (!search) return names
        const searchLower = search.toLowerCase()
        return names.filter(name => name.toLowerCase().includes(searchLower))
      },
    },
    Mutation: {
      fetchWikipage: (_: any, {name}: any, params: DancewikiParams | undefined) => service.create({name}, params),
    }
  }
}
