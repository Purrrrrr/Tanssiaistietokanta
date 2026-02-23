export type ID = string
export type ServiceName = 'dances' | 'events' | 'workshops' | 'dancewiki' | 'files' | 'users'
export interface Entity {
  _id: ID
}

export * from './dances'
export * from './events'
export * from './users'
export * from './workshops'
