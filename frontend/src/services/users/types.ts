import { ID, ServiceName } from 'backend/types'

import { JoinedList } from './typeUtils'

export type { ServiceName } from 'backend/types'

export const rights = ['create', 'delete', 'manage', 'read', 'modify'] as const
export type Rights = [...typeof rights]
export type Right = Rights[number]
export interface RightQuery {
  right: Right
  service: ServiceName
  entity?: RightsEntity
}

export type RightsEntity = unknown

export type EntityIds = {
  [Service in ServiceName as `${Singular<Service>}Id`]?: ID
}
type Singular<S extends string> = S extends `${infer P}s` ? P : S

export type RightQueryString = `${ServiceName}:${RightsList}`
export type RightsList = JoinedList<Rights, ',', 3>

// Example
// const right: RightQueryString = 'files:manage,create'

export type RightQueryInput = RightQueryString | RightQueryString[] | RightQuery | RightQuery[]
