import { useCallback, useEffect, useState } from 'react'

export interface File {
  _id: string
  name: string
  size: number
  //TODO: more fields
}

interface UploadOptions {
  path?: string
  file: Blob
  fileId?: string
  onProgress?: (progress: Progress) => unknown
}

export interface Progress {
  uploaded: number
  total: number
}

export function doUpload({ path, file, fileId, onProgress }: UploadOptions) {
  const promise = Promise.withResolvers<File>()

  const request = new XMLHttpRequest()
  request.upload.addEventListener('progress', ({ lengthComputable, loaded, total }) => {
    console.log({lengthComputable, loaded, total})
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
    promise.reject(new Error(request.responseText))
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
  const [files, setFiles] = useState<File[]>([])
  const refetch = useCallback(() => {
    getFiles().then(setFiles)
  }, [])
  useEffect(refetch, [refetch])
  return [files, refetch] as const
}
