import { entityCreateHook, entityDeleteHook, entityUpdateHook, graphql, setupServiceUpdateFragment } from '../backend'

setupServiceUpdateFragment(
  'workshops',
  `fragment WorkshopFragment on Workshop {
    _id, _versionId, eventId
    name
    abbreviation
    description
    instanceSpecificDances
    instances {
      _id
      dateTime
      durationInMinutes
      abbreviation
      hasVolunteerAssignments
      dances {
        _id
        name
      }
    }
  }`,
)

export const useCreateWorkshop = entityCreateHook('workshops', graphql(`
mutation createWorkshop($eventId: ID!, $workshop: WorkshopInput!) {
  createWorkshop(eventId: $eventId, workshop: $workshop) {
    _id, _versionId, eventId
    name
    abbreviation
    description
    instanceSpecificDances
    instances {
      _id
      dateTime
      durationInMinutes
      abbreviation
      hasVolunteerAssignments
      dances {
        _id
        name
      }
    }
  }
}`))

export const usePatchWorkshop = entityUpdateHook('workshops', graphql(`
mutation patchWorkshop($id: ID!, $workshop: WorkshopPatchInput!) {
  patchWorkshop(id: $id, workshop: $workshop) {
    _id, _versionId, eventId
    name
    abbreviation
    description
    instanceSpecificDances
    instances {
      _id
      dateTime
      durationInMinutes
      abbreviation
      hasVolunteerAssignments
      dances {
        _id
        name
      }
    }
  }
}`))

export const useDeleteWorkshop = entityDeleteHook('workshops', graphql(`
mutation deleteWorkshop($id: ID!) {
  deleteWorkshop(id: $id) {
    _id, _versionId, eventId
    name
    abbreviation
    description
    instanceSpecificDances
    instances {
      _id
      dateTime
      durationInMinutes
      abbreviation
      hasVolunteerAssignments
      dances {
        _id
        name
      }
    }
  }
}`))

export function workshopInstanceName(index: number, { abbreviation }: { abbreviation?: string | null }) {
  return abbreviation?.length
    ? abbreviation
    : index + 1
}
