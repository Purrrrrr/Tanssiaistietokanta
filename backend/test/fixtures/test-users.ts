import type { UserData } from '../../src/client'

export const adminUser: UserData = {
  username: 'admin@example.com',
  password: 'supersecret',
  name: 'Admin User',
  groups: ['admins', 'users'],
}
export const normalUser: UserData = {
  username: 'someone@example.com',
  password: 'supersecret',
  name: 'Test User',
  groups: ['file-access', 'users'],
}
export const disabledUser: UserData = {
  username: 'disabled@example.com',
  password: 'supersecret',
  name: 'Disabled User',
  groups: [],
}

export const testUsers: UserData[] = [
  adminUser,
  normalUser,
  disabledUser,
]
