import { RestResult } from './types'

import { backendUrl } from './constants'

export interface FetchWithProgressOptions {
  data: FormData
  onProgress?: (progress: FetchRequestProgress) => unknown
  signal?: AbortSignal
  accessToken: string | null
}

type Response = RestResult<string, 'aborted' | 'unknown'>

export interface FetchRequestProgress {
  uploaded: number
  total: number
}

export type Method = 'POST' | 'PUT' | 'PATCH'

export function fetchWithProgress(url: string, method: Method, { data, onProgress, signal, accessToken }: FetchWithProgressOptions): Promise<Response> {
  const promise = Promise.withResolvers<Response>()
  const request = new XMLHttpRequest()
  request.upload.addEventListener('progress', ({ lengthComputable, loaded, total }) => {
    if (lengthComputable) {
      onProgress?.({
        uploaded: loaded,
        total,
      })
    }
  })
  request.addEventListener('load', () => {
    promise.resolve({
      type: 'ok',
      status: request.status,
      data: request.responseText,
    })
  })
  request.addEventListener('error', () => {
    promise.resolve({
      type: 'error',
      error: 'unknown',
    })
  })
  signal?.addEventListener('abort', () => {
    request.abort()
    promise.resolve({
      type: 'error',
      error: 'aborted',
    })
  })
  request.open(method, backendUrl(url))
  if (accessToken) {
    request.setRequestHeader('Authorization', `Bearer ${accessToken}`)
  }
  request.send(data)

  return promise.promise
}
