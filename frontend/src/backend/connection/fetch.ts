import { RestResult } from './types'

import { backendUrl, debug } from './constants'

const baseHeaders = {
  'Content-Type': 'application/json',
}

export async function fetchRequest<T>(url: string, method: string, body?: Record<string, unknown>, accessToken?: string | null): Promise<RestResult<T, string>> {
  const response = await fetch(
    backendUrl(url),
    {
      method,
      headers: accessToken
        ? {
          ...baseHeaders,
          Authorization: `Bearer ${accessToken}`,
        }
        : baseHeaders,
      body: body ? JSON.stringify(body) : undefined,
    },
  )
  if (!response.ok) {
    debug('Request to %s failed with status: %d', url, response.status)
    return {
      type: 'error',
      status: response.status,
      error: await response.text(),
    }
  }

  return {
    type: 'ok',
    status: response.status,
    data: await response.json() as T,
  }
}
