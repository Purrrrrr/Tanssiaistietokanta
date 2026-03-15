import type { UserData } from '../../src/client'

type User = UserData & { _id: string }

export const adminUser: User = {
  _id: '',
  username: 'admin@example.com',
  password: 'supersecret',
  name: 'Admin User',
  groups: ['admins', 'users'],
}
export const normalUser: User = {
  _id: '',
  username: 'someone@example.com',
  password: 'supersecret',
  name: 'Test User',
  groups: ['file-access', 'users'],
}
export const disabledUser: User = {
  _id: '',
  username: 'disabled@example.com',
  password: 'supersecret',
  name: 'Disabled User',
  groups: [],
}

export const testUsers = [
  adminUser,
  normalUser,
  disabledUser,
] as const

export const enabledTestUsers = [
  adminUser,
  normalUser,
] as const
