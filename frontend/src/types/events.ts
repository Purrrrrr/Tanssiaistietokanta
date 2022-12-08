import { GetEventQuery } from 'types/gql/graphql'

export type Event = NonNullable<GetEventQuery['event']>
export type EventProgram = NonNullable<Event['program']>
