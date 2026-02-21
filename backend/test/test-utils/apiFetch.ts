import fetch from 'node-fetch'
import fetchCookie from 'fetch-cookie'
import { CookieJar } from 'tough-cookie'
import { app } from '../../src/app'

const port = app.get('port')
const appUrl = `http://${app.get('host')}:${port}/`

const cookieJar = new CookieJar()
const cookieFetch = fetchCookie(fetch, cookieJar)

interface Options extends Omit<RequestInit, 'body'> {
  headers?: Record<string, string>
  body?: object | undefined
}

export async function apiFetch(url: string, options: Options = {}) {
  const response = await cookieFetch(appUrl + url, {
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data = await response.json()
  return {
    status: response.status,
    headers: response.headers,
    data,
  }
}

export { cookieJar }
