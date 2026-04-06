export type ID = string
export type ServiceName = 'dances' | 'events' | 'workshops' | 'dancewiki' | 'files' | 'users' | 'volunteers' | 'eventVolunteers' | 'eventRoles' | 'eventVolunteerAssignments'
export interface Entity {
  _id: ID
}

export * from './dances'
export * from './eventRoles'
export * from './events'
export * from './eventVolunteers'
export * from './users'
export * from './volunteers'
export * from './workshops'
