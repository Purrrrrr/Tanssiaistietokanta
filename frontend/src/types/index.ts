export type ID = string
export type ServiceName = 'dances' | 'formationDiagrams' | 'events' | 'workshops' | 'dancewiki' | 'files' | 'documents' | 'users' | 'volunteers' | 'eventVolunteers' | 'eventRoles' | 'eventVolunteerAssignments' | 'ballrooms'
export interface Entity {
  _id: ID
}

export type * from './backend'
export type * from './ballrooms'
export type * from './dances'
export type * from './documents'
export type * from './eventRoles'
export type * from './events'
export type * from './eventVolunteerAssignments'
export { EventVolunteerRegistrationStatus } from './eventVolunteerAssignments'
export type * from './eventVolunteers'
export type * from './users'
export type * from './volunteers'
export type * from './workshops'
