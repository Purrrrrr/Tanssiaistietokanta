import {GetDancesQuery } from './gql/graphql'

export type Dance = GetDancesQuery['dances'][0]
export type { DanceInput, DancePatchInput } from 'types/gql/graphql'
