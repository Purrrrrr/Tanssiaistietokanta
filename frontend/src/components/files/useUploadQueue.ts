import { doUpload, type Progress } from 'services/files'

import { useQueue } from 'libraries/i18n/useQueue'

import { useGetUploadErrorMessage } from './useGetUploadErrorMessage'

export interface Upload {
  file: File
  abort: () => unknown
  error?: string
  progress?: Progress
}

export function useUploadQueue(root: string, path: string = '') {
  const [uploads, queue] = useQueue<Upload>()
  const getError = useGetUploadErrorMessage()

  const upload = async (file: File, fileId?: string) => {
    const abortController = new AbortController()
    const abort = () => {
      queue.remove(id)
      abortController.abort()
    }
    const id = queue.push({ file, abort })

    try {
      const result = await doUpload({
        root, path, fileId, file,
        signal: abortController.signal,
        onProgress: (progress) => queue.update(id, { progress }),
      })
      abort()
      return result
    } catch (e) {
      queue.update(id, { error: getError(e, file) })
      throw e
    }
  }

  return [upload, uploads] as const
}
