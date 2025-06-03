import { Application } from "../../declarations"
import { DancewikiParams } from "./dancewiki.class"

export default (app: Application) => {
  const service = app.service('dancewiki')

  return {
    Query: {
      searchWiki: async (_: any, {search}: any) => {
        const entries = await service.find({ query: { $select: ['name'] }})
        return entries.map(entry => entry.name).filter(name => name.startsWith(search))
      },
    },
    Mutation: {
      fetchWikipage: (_: any, {name}: any, params: DancewikiParams | undefined) => service.create({name}, params),
    }
  }
}
