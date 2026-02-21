import assert from 'assert'

import { app } from '../src/app'
import { normalUser } from './fixtures/test-users'
import { apiFetch, cookieJar } from './test-utils/apiFetch'

const port = app.get('port')

describe.only('application client tests', () => {
  before(async () => {
    await app.listen(port)
  })

  after(async () => {
    await app.teardown()
    await cookieJar.store.removeAllCookies()
  })

  it('creates and authenticates a user with username and password', async () => {
    const res = await apiFetch('authentication', {
      method: 'POST',
      body: {
        strategy: 'local',
        username: normalUser.username,
        password: normalUser.password,
      },
    })
    const { user, accessToken } = res.data

    assert.strictEqual(res.status, 201, 'Authentication request successful')
    assert.ok(user, 'Includes user in authentication data')
    assert.strictEqual(user.username, normalUser.username, 'Usernames match')
    assert.strictEqual(user.password, undefined, 'Password is hidden to clients')

    const cookie = await cookieJar.store.findCookie(app.get('host'), '/', 'refreshToken')
    assert.ok(cookie, 'Refresh token cookie is set')
    assert.ok(accessToken, 'Created access token for user')
  })

  it('refreshes access token with refresh token cookie', async () => {
    const res = await apiFetch('authentication', {
      method: 'POST',
      body: {
        strategy: 'refreshToken',
      },
    })

    assert.strictEqual(res.status, 201, 'Authentication request successful')
  })
})
