import { CreateEventMutationVariables, GetEventQuery } from 'types/gql/graphql'

export type EventInput = CreateEventMutationVariables['event']
export type Event = NonNullable<GetEventQuery['event']>
export type EventProgram = NonNullable<Event['program']>
export type Workshop = Event['workshops'][0]
