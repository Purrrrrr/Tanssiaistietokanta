// For more information about this file see https://dove.feathersjs.com/guides/cli/client.test.html
import assert from 'assert'

import rest from '@feathersjs/rest-client'
import { app } from '../src/app'
import { createClient } from '../src/client'
import type { UserData } from '../src/client'
import { rm } from 'fs/promises'

const port = app.get('port')
const appUrl = `http://${app.get('host')}:${port}`
console.log(appUrl)

describe('application client tests', () => {
  const client = createClient(rest(appUrl).fetch(fetch))

  before(async () => {
    await app.listen(port)
  })

  after(async () => {
    await app.teardown()
    await rm(app.get('nedb'), { recursive: true, force: true })
  })

  it('initialized the client', () => {
    assert.ok(client)
  })

  it('creates and authenticates a user with username and password', async () => {
    const userData: UserData = {
      username: 'someone@example.com',
      password: 'supersecret',
      name: 'Test User',
      groups: ['users'],
    }

    const res = await app.service('users').create(userData)
    console.log('Created user:', res)

    const { user, accessToken } = await client.authenticate({
      strategy: 'local',
      username: userData.username,
      password: userData.password,
    })

    assert.ok(accessToken, 'Created access token for user')
    assert.ok(user, 'Includes user in authentication data')
    assert.strictEqual(user.password, undefined, 'Password is hidden to clients')

    await client.logout()
  })
})
