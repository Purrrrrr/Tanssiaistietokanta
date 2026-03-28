import { Application } from '../../declarations'
import { VolunteersParams } from './volunteers.class'
import { versionHistoryFieldResolvers, versionHistoryResolver } from '../../utils/version-history-resolvers'

async function findVolunteeredIn(workshopService: any, volunteerId: string, eventId?: string) {
  const query: any = {
    $or: [
      { teacherIds: volunteerId },
      { assistantTeacherIds: volunteerId },
    ],
  }
  if (eventId) {
    query.eventId = eventId
  }
  const workshops = await workshopService.find({ query })

  return workshops.map((workshop: any) => {
    const roles: string[] = []
    if (workshop.teacherIds?.includes(volunteerId)) roles.push('teacher')
    if (workshop.assistantTeacherIds?.includes(volunteerId)) roles.push('assistant_teacher')
    return {
      _id: `${volunteerId}-${workshop._id}`,
      workshop,
      roles,
    }
  })
}

export default (app: Application) => {
  const service = app.service('volunteers')
  const workshopService = app.service('workshops')

  return {
    Volunteer: {
      versionHistory: versionHistoryResolver(service),
      volunteeredIn: (volunteer: { _id: string }, { eventId }: { eventId?: string }) =>
        findVolunteeredIn(workshopService, volunteer._id, eventId),
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
