import { GetEventVolunteerAssignmentsQuery } from './gql/graphql'

export { EventVolunteerRegistrationStatus } from 'types/gql/graphql'

export type EventVolunteerAssignment = GetEventVolunteerAssignmentsQuery['eventVolunteerAssignments'][0]
