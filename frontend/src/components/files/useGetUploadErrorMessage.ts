import { useCallback } from 'react'

import { getUploadError, MAX_UPLOAD_SIZE } from 'services/files'

import { useT } from 'i18n'

import useFilesize from './useFilesize'

export function useGetUploadErrorMessage() {
  const T = useT('components.files.UploadButton')
  const filesize = useFilesize()

  return useCallback((e: unknown, file: File): string => {
    const error = getUploadError(e)
    switch (error.code) {
      case 'aborted':
        return 'aborted'
      case 'too_big':
        return T('errorReason.too_big', {
          max_size: filesize(MAX_UPLOAD_SIZE),
        })
      case 'server':
        return T('errorReason.server', {
          message: error.message,
        })
      case 'already_exists':
        return T('errorReason.already_exists', { filename: file.name })
      case 'file_is_infected':
        return T('errorReason.file_is_infected')
      case 'unknown':
        return T('errorReason.unknown')
    }
  }, [T, filesize])
}
