import { entityCreateHook, entityDeleteHook, entityUpdateHook, graphql, setupServiceUpdateFragment } from '../backend'

setupServiceUpdateFragment(
  'workshops',
  `fragment WorkshopFragment on Workshop {
    _id, eventId
    name
    abbreviation
    description
    teachers
    dances {
      _id
      name
    }
  }`
)

export const useCreateWorkshop = entityCreateHook('workshops', graphql(`
mutation createWorkshop($eventId: ID!, $workshop: WorkshopInput!) {
  createWorkshop(eventId: $eventId, workshop: $workshop) {
    _id, eventId
    name
    abbreviation
    description
    teachers
    instances {
      _id
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
    _id, eventId
    name
    abbreviation
    description
    teachers
    instances {
      _id
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
    _id, eventId
    name
    abbreviation
    description
    teachers
    instances {
      _id
      dances {
        _id
        name
      }
    }
  }
}`))
