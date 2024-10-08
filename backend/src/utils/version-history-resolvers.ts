import { Params } from "@feathersjs/feathers";
import VersioningNeDBService, { Versionable } from "./VersioningNeDBService";

export interface BaseVersions {
  versions: Promise<Versionable[]>
}

export function versionHistoryResolver(service: VersioningNeDBService<Versionable, unknown, Params, unknown>) {
  return ({_id}: Versionable): BaseVersions => ({
    versions: service.find({
      query: {
        $sort: { _updatedAt: -1 },
        _id,
        searchVersions: true,
      }
    })
  })
}

export function versionHistoryFieldResolvers() {
  return {
    calendar: async ({ versions }: BaseVersions) => {
      const groups = Map.groupBy(await versions, version => getDate(version._updatedAt))

      return Array.from(groups.entries()).map(([date, versionsOnDate]) => ({
        date,
        versions: versionsOnDate.map(({_versionId, _versionNumber, _updatedAt}) => ({_versionId, _versionNumber, _updatedAt: getTime(_updatedAt)}))
      })).sort((a, b) => b.date.localeCompare(a.date))
    }
  }
}

const getDate = (d: string) => d.split('T')[0]
const getTime = (d: string) => d.split('T')[1].split('.')[0]
