import { useCallback, useRef, useState } from 'react'
import { Add } from '@blueprintjs/icons'

import { type File, type Progress, doUpload } from 'services/files'

import { Button, ButtonProps } from 'libraries/ui'
import { useT } from 'i18n'

import useFilesize from './useFilesize'

interface UploadButtonProps extends Pick<ButtonProps, 'color' | 'minimal' | 'paddingClass' | 'icon' | 'text'>{
  path?: string
  fileId?: string
  onUpload?: (file: File) => unknown
}

export function UploadButton({path, fileId, onUpload, icon, ...rest}: UploadButtonProps) {
  const input = useRef<HTMLInputElement>(null)
  const [upload, progress] = useUpload(path, fileId)
  const T = useT('components.files.UploadButton')
  const filesize = useFilesize()

  if (progress) {
    return <div>
      {filesize(progress.uploaded)}/{filesize(progress.total)}
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
      onChange={e => e.target.files && upload(e.target.files[0]).then(onUpload).then(() => e.target.value = '')}
    />
  </>
}

export function useUpload(path: string = '', fileId?: string) {
  const [progress, setProgress] = useState<Progress | null>(null)

  const upload = useCallback(async (file: Blob) => {
    return doUpload({
      path, fileId, file, onProgress: setProgress,
    }).finally(() => setProgress(null))
  }, [fileId, path])
  return [upload, progress] as const
}
