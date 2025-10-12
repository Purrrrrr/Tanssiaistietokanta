import { useCallback, useRef, useState } from 'react'
import { Add } from '@blueprintjs/icons'

import { type Progress, type UploadedFile, doUpload, getUploadError, MAX_UPLOAD_SIZE } from 'services/files'

import { Button, ButtonProps } from 'libraries/ui'
import { useT } from 'i18n'

import useFilesize from './useFilesize'

interface UploadButtonProps extends Pick<ButtonProps, 'color' | 'minimal' | 'paddingClass' | 'icon' | 'text'>{
  path?: string
  fileId?: string
  onUpload?: (file: UploadedFile) => unknown
}

export function UploadButton({path, fileId, onUpload, icon, ...rest}: UploadButtonProps) {
  const input = useRef<HTMLInputElement>(null)
  const [doUpload, progress, abort] = useUpload(path, fileId)
  const T = useT('components.files.UploadButton')
  const filesize = useFilesize()

  const getErrorMessage = (e: unknown) => {
    const error = getUploadError(e)
    switch (error.code) {
      case 'too_big':
        return T('errorReason.too_big', {
          max_size: filesize(MAX_UPLOAD_SIZE)
        })
      case 'server':
        return T('errorReason.server', {
          message: error.message,
        })
      case 'other':
        return T('errorReason.other')
    }
  }
  const upload = async (file: File) => {
    try {
      const result = await doUpload(file)
      onUpload?.(result)
    } catch (e) {
      const message = getErrorMessage(e)
      if (message) alert(message)
    }
  }

  if (progress) {
    return <div>
      {filesize(progress.uploaded)}/{filesize(progress.total)}
      <Button text="X" onClick={abort} />
    </div>
  }

  const title = T('upload')

  return <>
    <Button
      title={title}
      aria-description={title}
      icon={icon ?? <Add />}
      onClick={() => input.current?.click()}
      {...rest}
    />
    <input
      className="hidden"
      ref={input}
      type="file"
      onChange={e => e.target.files && upload(e.target.files[0])}
    />
  </>
}

export function useUpload(path: string = '', fileId?: string) {
  const [progress, setProgress] = useState<Progress | null>(null)
  const abortController = useRef<AbortController>()

  const upload = useCallback(async (file: Blob) => {
    abortController.current = new AbortController()
    return doUpload({
      path, fileId, file,
      signal: abortController.current.signal,
      onProgress: setProgress,
    }).finally(() => setProgress(null))
  }, [fileId, path])
  const abort = useCallback(() => abortController.current?.abort(), [])

  return [upload, progress, abort] as const
}
