import { Application, Resolvers } from '../../declarations'
import { removeNulls } from '../../utils/common-types'
import { getSelections } from '../../utils/resolvers'

export default (app: Application): Resolvers => {
  const eventService = app.service('events')
  const danceService = app.service('dances')
  function getDance(id: string) {
    return id ? danceService.get(id) : null
  }
  const service = app.service('workshops')
  const assignmentsService = app.service('eventVolunteerAssignments')

  return {
    Workshop: {
      _versionId: workshop => workshop._versionId ?? null,
      danceIds: workshop => workshop.instances.flatMap(i => i.danceIds ?? []),
      dances: workshop => workshop.instances.flatMap(i => i.danceIds ?? []).map(getDance).filter(dance => dance !== null),
      instances: async (workshop, _, _params, info) => {
        const fetchedFields = getSelections(info)
        if (!fetchedFields?.includes('hasVolunteerAssignments')) {
          return workshop.instances
        }
        const assignments = await Promise.all(
          workshop.instances.flatMap(
            i => assignmentsService.find({ query: {
              workshopId: workshop._id,
              workshopInstanceIds: i._id,
              $limit: 1,
            } }),
          ),
        )
        return workshop.instances.map((instance, index) => ({
          ...instance,
          hasVolunteerAssignments: assignments[index]?.length > 0,
        }))
      },
    },
    WorkshopInstance: {
      dances: workshop => workshop.danceIds?.map(getDance).filter(dance => dance !== null) ?? [],
    },
    Query: {
      workshop: async (_, { id, eventVersionId }, params) => {
        if (eventVersionId) {
          await eventService.startVersionedSearchFrom(eventVersionId)
        }
        return service.get(id, params)
      },
    },
    Mutation: {
      createWorkshop: (_, { eventId, workshop }, params) => {
        const { instances, ...workshopData } = workshop
        return service.create({
          eventId,
          ...removeNulls(workshopData),
          instances: instances?.map(instance => removeNulls(instance)),
        }, params)
      },
      patchWorkshop: (_, { id, workshop }, params) => {
        const { instances, ...workshopData } = workshop
        const patch = {
          ...removeNulls(workshopData),
          ...(instances
            ? {
              instances: instances.map(({ danceIds = null, ...instance }) => ({ danceIds, ...removeNulls(instance) })),
            }
            : {}
          ),
        }
        return service.patch(id, patch, params)
      },
      deleteWorkshop: (_, { id }, params) => service.remove(id, params),
    },
  }
}
