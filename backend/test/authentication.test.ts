import { expect } from 'chai'

import { app } from '../src/app'
import { normalUser } from './fixtures/test-users'
import { apiFetch, cookieJar } from './test-utils/apiFetch'

const port = app.get('port')

describe('application client tests', () => {
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

    expect(res.status, 'Authentication request successful').to.equal(201)
    expect(user, 'Includes user in authentication data').to.be.an('object')
    expect(user.username, 'Usernames match').to.equal(normalUser.username)
    expect(user.password, 'Password is hidden to clients').to.be.undefined

    const cookie = await cookieJar.store.findCookie(app.get('host'), '/', 'refreshToken')
    expect(cookie, 'Refresh token cookie is set').to.exist
    expect(accessToken, 'Created access token for user').to.be.a('string')
  })

  it('refreshes access token with refresh token cookie', async () => {
    const res = await apiFetch('authentication', {
      method: 'POST',
      body: {
        strategy: 'refreshToken',
      },
    })

    expect(res.status, 'Authentication request successful').to.equal(201)
  })
})
