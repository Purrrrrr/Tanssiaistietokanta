import { useRef } from 'react'
import { Add, InfoSign } from '@blueprintjs/icons'

import { useFiles } from 'services/files'

import { useFormatDateTime } from 'libraries/i18n/dateTime'
import { useAlerts } from 'libraries/overlays/AlertContext'
import { Button, RegularLink } from 'libraries/ui'
import ItemList from 'libraries/ui/ItemList'
import { useT } from 'i18n'

import { DeleteFileButton } from './DeleteFileButton'
import { UploadProgressList } from './UploadProgres'
import useFilesize from './useFilesize'
import { useUploadQueue } from './useUploadQueue'

export function FileList() {
  const input = useRef<HTMLInputElement>(null)
  const [files, fetchFiles] = useFiles()
  const [doUpload, uploads] = useUploadQueue('', '')
  const filesize = useFilesize()
  const T = useT('components.files')
  const formatDate = useFormatDateTime()
  const showAlert = useAlerts()

  const startUpload = async (file: File) => {
    const existingFile = files.find(f => f.name === file.name)
    if (existingFile) {
      await showAlert({
        title: T('alreadyExistsConfirm.title'),
        children: T('alreadyExistsConfirm.content', { filename: file.name }),
        buttons: [
          {
            text: T('alreadyExistsConfirm.ok'),
            action: () => doUpload(file, existingFile._id).then(fetchFiles),
          },
          T('alreadyExistsConfirm.cancel'),
        ],
      })
    } else {
      await doUpload(file).then(fetchFiles)
    }
  }

  return <div>
    <input
      className="hidden"
      ref={input}
      type="file"
      onChange={e => e.target.files && startUpload(e.target.files[0])}
    />
    <div className="flex my-5 gap-3 items-start">
      <Button icon={<Add />} onClick={() => input.current?.click()} text="Lisää tiedosto" />
      <UploadProgressList uploads={uploads} />
    </div>
    <ItemList columns="grid-cols-[1fr_minmax(200px,auto)_minmax(100px,auto)_min-content]">
      {files.map(file =>
        <ItemList.Row key={file._id}>
          <RegularLink href={`/api/files/${file._id}?download=true`} target="_blank">{file.name}</RegularLink>
          <span>{formatDate(file._updatedAt)}</span>
          <span>{filesize(file.size)}</span>
          <div>
            <DeleteFileButton file={file} onDelete={fetchFiles} />
          </div>
        </ItemList.Row>,
      )}
      {files.length === 0 &&
        <div className="col-span-full py-4 text-base text-center text-muted">
          <InfoSign size={20} className="mr-2" />
          {T('noFiles')}
        </div>
      }
    </ItemList>
  </div>
}
