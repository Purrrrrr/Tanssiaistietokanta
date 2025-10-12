export interface FetchWithProgressOptions {
  data: FormData
  onProgress?: (progress: Progress) => unknown
  signal?: AbortSignal
}

type Response = {
  type: 'ok'
  status: number
  content: string
} | {
  type: 'error'
  error: 'aborted' | 'unknown'
}

export interface Progress {
  uploaded: number
  total: number
}


export function fetchWithProgress(method: string, url: string, { data, onProgress, signal }: FetchWithProgressOptions) {
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
      content: request.responseText
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
  request.open(method, url)
  request.send(data)

  return promise.promise
}
