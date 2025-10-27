import { useCallback, useEffect, useState } from 'react'

import { fetchWithProgress, FetchWithProgressOptions } from 'utils/fetchWithProgress'

export type { Progress } from 'utils/fetchWithProgress'

export const MAX_UPLOAD_SIZE = 20 * 1024 ** 2

export type UploadFailureReason = 'aborted' | 'too_big' | 'already_exists' | 'server' | 'unknown' | 'file_is_infected'

class UploadError extends Error {
  code: UploadFailureReason
  constructor(cause: UploadFailureReason, serverMessage?: string) {
    super(serverMessage)
    this.code = cause
  }
}

export function getUploadError(error: unknown): UploadError {
  if (error instanceof UploadError) {
    return error
  }
  return new UploadError('unknown')
}

export interface UploadedFile {
  _id: string
  _updatedAt: string
  name: string
  size: number
  // TODO: more fields
}

interface UploadOptions extends Pick<FetchWithProgressOptions, 'signal' | 'onProgress'> {
  root?: string
  path?: string
  filename?: string
  file: Blob
  fileId?: string
}

export async function doUpload({ root, path, file, filename, fileId, onProgress, signal }: UploadOptions) {
  if (file.size > MAX_UPLOAD_SIZE) {
    return Promise.reject(new UploadError('too_big'))
  }

  const data = toFormData({
    root: root ?? '',
    path: path ?? '',
    upload: file,
    filename,
  })
  const options = { data, onProgress, signal }
  const response = fileId
    ? await fetchWithProgress('PUT', `/api/files/${fileId}`, options)
    : await fetchWithProgress('POST', '/api/files', options)

  if (response.type === 'error') {
    throw new UploadError(response.error)
  }

  switch (response.status) {
    case 200:
    case 201:
      return JSON.parse(response.content) as UploadedFile
    case 409:
      throw new UploadError('already_exists')
    case 422:
      throw new UploadError('file_is_infected')
    default:
      throw new UploadError('server', response.content)
  }
}

function toFormData(object: object) {
  const formData = new FormData()
  for (const [key, value] of Object.entries(object)) {
    if (value != null) {
      formData.append(key, value)
    }
  }
  return formData
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

export function useDeleteFile() {
  return async (fileId: string) => {
    await fetch(`/api/files/${fileId}`, { method: 'DELETE' })
  }
}
