import { entityListQueryHook, graphql, setupServiceUpdateFragment } from '../backend'

setupServiceUpdateFragment(
  'eventRoles',
  `fragment EventRoleFragment on EventRole {
    _id
    name
    plural
    description
    type
    appliesToWorkshops
    order
  }`,
)

export const useEventRoles = entityListQueryHook('eventRoles', graphql(`
query getEventRoles {
  eventRoles {
    _id
    name
    plural
    description
    type
    appliesToWorkshops
    order
  }
}`))
