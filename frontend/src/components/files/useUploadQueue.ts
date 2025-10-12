import { useState } from 'react'

import { type Progress, doUpload  } from 'services/files'

import { useGetUploadErrorMessage } from './useGetUploadErrorMessage'

interface Upload {
  id: number
  file: File
  abort: () => unknown
  error?: string
  progress?: Progress
}

let idCounter = 0

export function useUploadQueue(root: string = '', path: string = '') {
  const [uploads, setUploads] = useState<Upload[]>([])
  const getError = useGetUploadErrorMessage()

  const upload = async (file: File, fileId?: string) => {
    const abortController = new AbortController()
    const id = ++idCounter
    const abort = () => {
      abortController.abort()
      setUploads(uploads => uploads.filter(u => u.id != id))
    }
    const updateState = (state: Partial<Upload>) => setUploads(uploads =>
      uploads.map(u => u.id === id ? { ...u, ...state } : u)
    )
    setUploads(uploads => [
      ...uploads,
      { id, file, abort },
    ])

    try {
      const result = await doUpload({
        root, path, fileId, file,
        signal: abortController.signal,
        onProgress: (progress) => updateState({ progress }),
      })
      abort()
      return result
    } catch (e) {
      updateState({ error: getError(e, file) })
      throw e
    }
  }

  return [upload, uploads] as const
}
