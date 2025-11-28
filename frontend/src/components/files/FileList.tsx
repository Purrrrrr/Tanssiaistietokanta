import { useRef } from 'react'
import { Add, InfoSign } from '@blueprintjs/icons'

import { useFiles } from 'services/files'

import { useFormatDateTime } from 'libraries/i18n/dateTime'
import { useAlerts } from 'libraries/overlays'
import { Button, RegularLink } from 'libraries/ui'
import ItemList from 'libraries/ui/ItemList'
import { useT } from 'i18n'

import { DeleteFileButton } from './DeleteFileButton'
import { RenameFileButton } from './RenameFileButton'
import { UploadProgressList } from './UploadProgres'
import useFilesize from './useFilesize'
import { useUploadQueue } from './useUploadQueue'

interface FileListProps {
  root: string
}

export function FileList({ root }: FileListProps) {
  const input = useRef<HTMLInputElement>(null)
  const queryVars = { root }
  const [files] = useFiles(queryVars)
  const [doUpload, uploads] = useUploadQueue(root)
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
            action: () => doUpload(file, existingFile._id),
          },
          T('alreadyExistsConfirm.cancel'),
        ],
      })
    } else {
      await doUpload(file)
    }
  }

  return <div>
    <ItemList columns="grid-cols-[1fr_minmax(200px,auto)_minmax(100px,auto)_max-content]">
      {files.map(file =>
        <ItemList.Row key={file._id}>
          <RegularLink href={`/api/files/${file._id}?download=true`} target="_blank" title={file.name} className="overflow-ellipsis overflow-hidden">
            {file.name}
          </RegularLink>
          <span>{formatDate(file._updatedAt)}</span>
          <span>{filesize(file.size)}</span>
          <div>
            <RenameFileButton file={file} />
            <DeleteFileButton file={file} />
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
  </div>
}
