import { Application, Resolvers } from '../../declarations'

import { Params } from '@feathersjs/feathers'
import VersioningNeDBService, { Versionable } from '../../utils/VersioningNeDBService'

export interface BaseVersionHistory {
  versions: Promise<VersionInfo[]>
}
interface VersionInfo extends Versionable {
  _versionId: string
}

export function versionHistoryResolver(service: VersioningNeDBService<Versionable, unknown, Params, unknown>) {
  return ({ _id }: Versionable): BaseVersionHistory => ({
    versions: service.find({
      query: {
        $sort: { _updatedAt: -1 },
        _id,
        searchVersions: true,
      },
    }) as Promise<VersionInfo[]>,
  })
}

const getDate = (d: string) => d.split('T')[0]
const getTime = (d: string) => d.split('T')[1].split('.')[0]

export default (app: Application): Resolvers => {
  return {
    Dance: {
      versionHistory: versionHistoryResolver(app.service('dances')),
    },
    Event: {
      versionHistory: versionHistoryResolver(app.service('events')),
    },
    EventRole: {
      versionHistory: versionHistoryResolver(app.service('eventRoles')),
    },
    EventVolunteer: {
      versionHistory: versionHistoryResolver(app.service('eventVolunteers')),
    },
    EventVolunteerAssignment: {
      versionHistory: versionHistoryResolver(app.service('eventVolunteerAssignments')),
    },
    Volunteer: {
      versionHistory: versionHistoryResolver(app.service('volunteers')),
    },
    VersionHistory: {
      calendar: async ({ versions }: BaseVersionHistory) => {
        const groups = Map.groupBy(await versions, version => getDate(version._updatedAt))

        return Array.from(groups.entries())
          .map(([date, versionsOnDate]) => ({
            date,
            versions: versionsOnDate
              .map(({ _versionId, _versionNumber, _updatedAt }) => ({
                _versionId, _versionNumber, _updatedAt: getTime(_updatedAt),
              })),
          }))
          .sort((a, b) => b.date.localeCompare(a.date))
      },
    },
  }
}
