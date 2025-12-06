import { useRef } from 'react'
import { Add, InfoSign } from '@blueprintjs/icons'

import { useFiles } from 'services/files'

import { useFormatDateTime } from 'libraries/i18n/dateTime'
import { useAlerts } from 'libraries/overlays'
import { Button, RegularLink } from 'libraries/ui'
import ItemList from 'libraries/ui/ItemList'
import { useT } from 'i18n'
import { useMultipleSelection } from 'utils/useMultipleSelection'

import { DeleteFileButton } from './DeleteFileButton'
import { DeleteSelectionButton } from './DeleteSelectionButton'
import { FileDropZone } from './FileDropZone'
import { RenameFileButton } from './RenameFileButton'
import { UploadProgressList } from './UploadProgres'
import useFilesize from './useFilesize'
import { useUploadQueue } from './useUploadQueue'
import { SelectionBox } from './SelectionBox'

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
  const selector = useMultipleSelection(files)

  const getExistingFile = (file: File) => files.find(f => f.name === file.name)
  const startUploads = async (files: File[]) => {
    const filesAndDuplicates = files.map(file => ({ file, duplicate: getExistingFile(file) }))

    filesAndDuplicates.filter(f => !f.duplicate).map(file => doUpload(file.file))
    for (const { file, duplicate } of filesAndDuplicates) {
      if (!duplicate) continue
      await showAlert({
        title: T('alreadyExistsConfirm.title'),
        children: T('alreadyExistsConfirm.content', { filename: file.name }),
        buttons: [
          {
            text: T('alreadyExistsConfirm.ok'),
            action: () => doUpload(file, duplicate._id),
          },
          T('alreadyExistsConfirm.cancel'),
        ],
      })
    }
  }
  const onDragAndDrop = (items: DataTransferItem[]) => {
    startUploads(
      items
        .filter(item => item.webkitGetAsEntry()?.isFile)
        .map(item => item.getAsFile())
        .filter(file => file !== null),
    )
  }

  return <div>
    <FileDropZone onDrop={onDragAndDrop}>
      <ItemList columns="grid-cols-[auto_1fr_minmax(200px,auto)_minmax(100px,auto)_max-content]">
        {files.length > 0 &&
          <ItemList.Header>
            <SelectionBox {...selector.selectAllProps} />
            <span>{T('name')}</span>
            <span>{T('date')}</span>
            <span>{T('size')}</span>
          </ItemList.Header>
        }
        {files.map(file =>
          <ItemList.Row key={file._id}>
            <SelectionBox {...selector.selectItemProps(file)} />
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
        multiple
        onChange={e => e.target.files && startUploads([...e.target.files])}
      />
    </FileDropZone>
    <div className="flex my-5 gap-3 items-start">
      {selector.selected.length > 0 &&
        <div className="flex gap-3 items-center">
          {T('filesSelected', {
            count: selector.selected.length,
            sizeTotal: filesize(selector.selected.map(file => file.size).reduce((a, b) => a + b)),
          })}
          <DeleteSelectionButton files={selector.selected} />
        </div>
      }
      <Button icon={<Add />} onClick={() => input.current?.click()} text="Lisää tiedosto" />
      <UploadProgressList uploads={uploads} />
    </div>
  </div>
}
