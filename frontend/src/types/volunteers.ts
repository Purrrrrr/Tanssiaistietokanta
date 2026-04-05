import { GetVolunteerNamesQuery, GetVolunteersQuery } from './gql/graphql'

export type Volunteer = GetVolunteersQuery['volunteers'][0]
// id + name
export type VolunteerListItem = GetVolunteerNamesQuery['volunteers'][0]
