import { useCallback, useEffect, useState } from 'react'

export const MAX_UPLOAD_SIZE = 20 * 1024 ** 2

export type UploadFailureReason = 'aborted' | 'too_big' | 'server' | 'other'

class UploadError extends Error {
  code: UploadFailureReason
  constructor(cause: UploadFailureReason, serverMessage?: string) {
    super(serverMessage)
    this.code = cause
  }
}

export function getUploadError(error: unknown): UploadError{
  if (error instanceof UploadError) {
    return error
  }
  return new UploadError('other')
}

export interface UploadedFile {
  _id: string
  _updatedAt: string
  name: string
  size: number
  //TODO: more fields
}

interface UploadOptions {
  path?: string
  file: Blob
  fileId?: string
  onProgress?: (progress: Progress) => unknown
  signal?: AbortSignal
}

export interface Progress {
  uploaded: number
  total: number
}

export function doUpload({ path, file, fileId, onProgress, signal }: UploadOptions) {
  const promise = Promise.withResolvers<UploadedFile>()

  if (file.size > MAX_UPLOAD_SIZE) {
    return Promise.reject(new UploadError('too_big'))
  }

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
    promise.resolve(JSON.parse(request.responseText))
  })
  request.addEventListener('error', () => {
    promise.reject(new UploadError('server', request.responseText))
  })
  signal?.addEventListener('abort', () => {
    request.abort()
    promise.reject(new UploadError('aborted'))
  })
  if (fileId) {
    request.open('PUT', `/api/files/${fileId}`)
  } else {
    request.open('POST', '/api/files')
  }
  const formData = new FormData()
  formData.append('path', path ?? '')
  formData.append('upload', file)
  request.send(formData)

  return promise.promise
}

export async function getFiles() {
  const response = await fetch('/api/files')
  return response.json()
}

export function useFiles() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const refetch = useCallback(() => {
    getFiles().then(setFiles)
  }, [])
  useEffect(refetch, [refetch])
  return [files, refetch] as const
}
