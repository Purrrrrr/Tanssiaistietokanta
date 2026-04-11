import { Application, Resolvers } from '../../declarations'
import { removeNulls } from '../../utils/common-types'

export default (app: Application): Resolvers => {
  const eventService = app.service('events')
  const danceService = app.service('dances')
  function getDance(id: string) {
    return id ? danceService.get(id) : null
  }
  const service = app.service('workshops')

  return {
    Workshop: {
      _versionId: workshop => workshop._versionId ?? null,
      danceIds: workshop => workshop.instances.flatMap(i => i.danceIds ?? []),
      dances: workshop => workshop.instances.flatMap(i => i.danceIds ?? []).map(getDance).filter(dance => dance !== null),
    },
    WorkshopInstance: {
      dances: workshop => workshop.danceIds?.map(getDance).filter(dance => dance !== null) ?? [],
    },
    Query: {
      workshop: async (_, { id, eventVersionId }, params) => {
        if (eventVersionId) {
          // Trigger searching of versions of workshops by event version id
          await eventService.find({ query: { _versionId: eventVersionId } })
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
