import { GetVolunteersQuery } from './gql/graphql'

export type Volunteer = GetVolunteersQuery['volunteers'][0]
