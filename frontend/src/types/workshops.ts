import { GetWorkshopQuery } from './gql/graphql'

export type { WorkshopInput } from './gql/graphql'
export type Workshop = GetWorkshopQuery['workshop']
