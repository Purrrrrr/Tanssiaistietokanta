import {GetDancesQuery } from './gql/graphql'

export type DanceWithEvents = GetDancesQuery['dances'][0]
export type Dance = Omit<GetDancesQuery['dances'][0], 'events'>
export type { DanceInput, DancePatchInput } from 'types/gql/graphql'
