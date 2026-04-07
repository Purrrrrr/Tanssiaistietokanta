import type { EventRolesData } from '../../src/services/eventRoles/eventRoles.schema'

type EventRoleFixture = { _id: string } & EventRolesData

export const testTeacherRole: EventRoleFixture = {
  _id: '',
  name: 'Test Teacher Role',
  description: 'A teacher role for tests',
  plural: 'Test Teacher Roles',
  appliesToWorkshops: true,
  order: 1,
  type: 'TEACHER',
}

export const testEventRoles = [testTeacherRole] as const
