import { Application } from '../../declarations'
import { VolunteersParams } from './volunteers.class'
import { versionHistoryFieldResolvers, versionHistoryResolver } from '../../utils/version-history-resolvers'

export default (app: Application) => {
  const service = app.service('volunteers')

  return {
    Volunteer: {
      versionHistory: versionHistoryResolver(service),
    },
    VersionHistory: versionHistoryFieldResolvers(),
    Query: {
      volunteer: (_: any, { id, versionId }: any, params: VolunteersParams | undefined) => versionId
        ? service.get(id, { ...params, query: { _versionId: versionId } })
        : service.get(id, params),
      volunteers: (_: any, __: any, params: VolunteersParams | undefined) => service.find(params),
    },
    Mutation: {
      createVolunteer: (_: any, { volunteer }: any, params: VolunteersParams | undefined) => service.create(volunteer, params),
      modifyVolunteer: (_: any, { id, volunteer }: any, params: VolunteersParams | undefined) => service.update(id, volunteer, params),
      patchVolunteer: (_: any, { id, volunteer }: any, params: VolunteersParams | undefined) => service.patch(id, volunteer, params),
      deleteVolunteer: (_: any, { id }: any, params: VolunteersParams | undefined) => service.remove(id, params),
    },
  }
}
