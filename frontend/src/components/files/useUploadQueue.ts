import { doUpload, FileOwner, FileOwningId, type Progress, UploadedFile } from 'services/files'

import { useQueue } from 'libraries/i18n/useQueue'

import { useGetUploadErrorMessage } from './useGetUploadErrorMessage'

const MAX_CONCURRENT_UPLOADS = 5

export interface Upload {
  file: File
  abort: () => unknown
  state: 'pending' | 'in-progress' | 'error'
  start: () => void
  error?: string
  progress?: Progress
}

export function useUploadQueue(owner: FileOwner, owningId: FileOwningId, path: string = '') {
  const [uploads, queue] = useQueue<Upload>()
  const getError = useGetUploadErrorMessage()

  const upload = async (file: File, fileId?: string, autoRename?: boolean) => {
    const abortController = new AbortController()
    const queuePending = () => {
      queue.updateItems(uploads => {
        let maxStartCount = MAX_CONCURRENT_UPLOADS - inProgressCount(uploads)

        return uploads.map(upload => {
          if (upload.state !== 'pending' || maxStartCount === 0) {
            return upload
          }
          maxStartCount -= 1
          upload.start()
          return { ...upload, start: () => {}, state: 'in-progress' }
        })
      })
    }
    const removeUpload = () => {
      queue.remove(id)
      abortController.abort()
    }

    const result = Promise.withResolvers<UploadedFile>()
    const id = queue.push({
      file,
      abort: removeUpload,
      state: 'pending',
      start: async () => {
        try {
          const uploadedFile = await doUpload({
            owner, owningId, path, fileId, file,
            autoRename,
            signal: abortController.signal,
            onProgress: (progress) => queue.update(id, { progress }),
          })
          removeUpload()
          result.resolve(uploadedFile)
        } catch (e) {
          queue.update(id, { error: getError(e, file), state: 'error' })
          result.reject(e)
        } finally {
          queuePending()
        }
      },
    })

    queuePending()
    return result.promise
  }

  return [upload, uploads] as const
}

function inProgressCount(queue: Upload[]) {
  return queue.filter(upload => upload.state === 'in-progress').length
}
