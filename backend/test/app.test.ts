// For more information about this file see https://dove.feathersjs.com/guides/cli/app.test.html
import { expect } from 'chai'
import { app, initializeApp } from '../src/app'

const port = app.get('port')
const appUrl = `http://${app.get('host')}:${port}`

describe('Feathers application tests', () => {

  before(async () => {
    await initializeApp()
  })

  after(async () => {
    await app.teardown()
  })

  it('starts and shows the index page', async () => {
    const data = await fetch(appUrl).then(response => response.text())

    expect(data).to.include('<html lang="en">')
  })

  it('shows a 404 JSON error', async () => {
    const response = await fetch(`${appUrl}/path/to/nowhere`, {
      headers: {
        'Response-Type': 'json',
      },
    })
    expect(response?.status).to.equal(404)

    const data = await response.json()
    expect(data?.code).to.equal(404)
    expect(data?.name).to.equal('NotFound')
  })
})
