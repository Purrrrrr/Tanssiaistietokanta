// For more information about this file see https://dove.feathersjs.com/guides/cli/client.test.html
import { expect } from 'chai'

import rest from '@feathersjs/rest-client'
import { app } from '../src/app'
import { createClient } from '../src/client'
import { normalUser } from './fixtures/test-users'

const port = app.get('port')
const appUrl = `http://${app.get('host')}:${port}`

describe('application client tests', () => {
  const client = createClient(rest(appUrl).fetch(fetch))

  before(async () => {
    await app.listen(port)
  })

  after(async () => {
    await app.teardown()
  })

  it('initialized the client', () => {
    expect(client).to.be.an('object')
  })

  it('creates and authenticates a user with username and password', async () => {
    const { user, accessToken } = await client.authenticate({
      strategy: 'local',
      username: normalUser.username,
      password: normalUser.password,
    })

    expect(accessToken, 'Created access token for user').to.be.a('string')
    expect(user, 'Includes user in authentication data').to.be.an('object')
    expect(user.password, 'Password is hidden to clients').to.be.undefined

    await client.logout()
  })
})
