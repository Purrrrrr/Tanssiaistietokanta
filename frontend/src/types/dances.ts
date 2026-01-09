import { GetDanceQuery, GetDancesQuery, SearchDancewikiQuery } from './gql/graphql'

export type DanceListItem = GetDancesQuery['dances'][0]
export type DanceWithEvents = GetDanceQuery['dance']
export type Dance = Omit<DanceWithEvents, 'events'>
export type EditableDance = Omit<Dance, 'wikipage'>
export type { DanceInput, DancePatchInput } from 'types/gql/graphql'

export type DanceWikiSearchResult = SearchDancewikiQuery['searchWiki'][0]
