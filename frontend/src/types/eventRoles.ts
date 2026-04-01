import { GetEventRolesQuery } from './gql/graphql'

export type EventRole = GetEventRolesQuery['eventRoles'][0]
