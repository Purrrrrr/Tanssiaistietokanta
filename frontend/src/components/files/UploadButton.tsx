import { useRef } from 'react'
import { Add } from '@blueprintjs/icons'

import { type UploadedFile } from 'services/files'

import { Button, ButtonProps } from 'libraries/ui'
import { useT } from 'i18n'

import useFilesize from './useFilesize'
import { useUploadQueue } from './useUploadQueue'

interface UploadButtonProps extends Pick<ButtonProps, 'color' | 'minimal' | 'paddingClass' | 'icon' | 'text'>{
  path?: string
  fileId?: string
  onUpload?: (file: UploadedFile) => unknown
}

export function UploadButton({path, fileId, onUpload, icon, ...rest}: UploadButtonProps) {
  const input = useRef<HTMLInputElement>(null)
  const [doUpload, uploads] = useUploadQueue('', path)
  const T = useT('components.files.UploadButton')
  const filesize = useFilesize()

  const upload = (file: File) => doUpload(file, fileId).then(onUpload)

  if (uploads.length > 0) {
    const { progress, abort } = uploads[0]
    if (progress) {
      return <div>
        {filesize(progress.uploaded)}/{filesize(progress.total)}
        <Button text="X" onClick={abort} />
      </div>
    }
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
