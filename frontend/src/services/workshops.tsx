import { backendQueryHook, graphql, setupServiceUpdateFragment, entityCreateHook, entityDeleteHook, entityUpdateHook } from '../backend'

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

const useWorkshopInternal = backendQueryHook(graphql(`
query getWorkshop($id: ID!) {
  workshop(id: $id) {
    _id, eventId
    name
    abbreviation
    description
    teachers
    dances {
      _id
      name
    }
  }
}`))
export function useWorkshop(id: string) {
  const res = useWorkshopInternal({id})
  return [res?.data?.workshop, res] as const
}

export const useCreateWorkshop = entityCreateHook('workshops', graphql(`
mutation createWorkshop($eventId: ID!, $workshop: WorkshopInput!) {
  createWorkshop(eventId: $eventId, workshop: $workshop) {
    _id, eventId
    name
    abbreviation
    description
    teachers
    dances {
      _id
      name
    }
  }
}`))

export const useModifyWorkshop = entityUpdateHook('workshops', graphql(`
mutation modifyWorkshop($id: ID!, $workshop: WorkshopInput!) {
  modifyWorkshop(id: $id, workshop: $workshop) {
    _id, eventId
    name
    abbreviation
    description
    teachers
    dances {
      _id
      name
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
    dances {
      _id
      name
    }
  }
}`))
