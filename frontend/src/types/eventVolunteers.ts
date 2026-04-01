import { CreateEventVolunteerMutationVariables, GetEventVolunteersQuery } from './gql/graphql'

export type EventVolunteerInput = CreateEventVolunteerMutationVariables['eventVolunteer']
export type EventVolunteer = GetEventVolunteersQuery['eventVolunteers'][0]
