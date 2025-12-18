import { useRef } from 'react'
import { Add } from '@blueprintjs/icons'

import { useFiles } from 'services/files'

import { useFormatDateTime } from 'libraries/i18n/dateTime'
import { useAlerts } from 'libraries/overlays'
import { Button, ItemList, RegularLink } from 'libraries/ui'
import { useT } from 'i18n'
import { useMultipleSelection } from 'utils/useMultipleSelection'

import { DeleteFileButton } from './DeleteFileButton'
import { DeleteSelectionButton } from './DeleteSelectionButton'
import { DownloadSelectionButton } from './DownloadSelectionButton'
import { FileDropZone } from './FileDropZone'
import { RenameFileButton } from './RenameFileButton'
import { SelectionBox } from './SelectionBox'
import { UploadProgressList } from './UploadProgres'
import useFilesize from './useFilesize'
import { useUploadQueue } from './useUploadQueue'

interface FileListProps {
  root: string
  path?: string
}

export function FileList({ root, path }: FileListProps) {
  const input = useRef<HTMLInputElement>(null)
  const queryVars = { root, path }
  const [files] = useFiles(queryVars)
  const [doUpload, uploads] = useUploadQueue(root, path)
  const filesize = useFilesize()
  const T = useT('components.files')
  const formatDate = useFormatDateTime()
  const showAlert = useAlerts()
  const selector = useMultipleSelection(files)

  const startUploads = async (filesToUpload: File[]) => {
    const filesAndDuplicates = filesToUpload.map(file => ({
      file,
      uploadedDuplicate: files.find(f => f.name === file.name),
      uploadingDuplicate: uploads.find(upload => upload.file.name === file.name),
    }))

    filesAndDuplicates.filter(f => !f.uploadedDuplicate && !f.uploadingDuplicate).map(file => doUpload(file.file))
    for (const { file, uploadedDuplicate, uploadingDuplicate } of filesAndDuplicates) {
      if (uploadingDuplicate) {
        await showAlert({
          title: T('alreadyUploadingAlert.title'),
          children: T('alreadyUploadingAlert.content', { filename: file.name }),
          button: T('alreadyUploadingAlert.ok'),
        })
        continue
      }
      if (!uploadedDuplicate) continue
      await showAlert({
        title: T('alreadyExistsConfirm.title'),
        children: T('alreadyExistsConfirm.content', { filename: file.name }),
        buttons: [
          {
            text: T('alreadyExistsConfirm.ok'),
            action: () => doUpload(file, uploadedDuplicate._id),
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
      <ItemList
        items={files}
        emptyText={T('noFiles')}
        columns="grid-cols-[auto_1fr_minmax(200px,auto)_minmax(100px,auto)_max-content]">
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
            <RegularLink href={`/api/files/${file._id}?download=true`} target="_blank" title={file.name} className="overflow-hidden overflow-ellipsis">
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
      </ItemList>
      <input
        className="hidden"
        ref={input}
        type="file"
        multiple
        onChange={e => e.target.files && startUploads([...e.target.files])}
      />
    </FileDropZone>
    <div className="flex gap-3 items-start my-5">
      <Button icon={<Add />} onClick={() => input.current?.click()} text="Lisää tiedosto" />
      {selector.selected.length > 0 &&
        <div className="flex gap-3 items-center">
          {T('filesSelected', {
            count: selector.selected.length,
            sizeTotal: filesize(selector.selected.map(file => file.size).reduce((a, b) => a + b)),
          })}
          <DeleteSelectionButton files={selector.selected} />
          <DownloadSelectionButton files={selector.selected} />
        </div>
      }
      <UploadProgressList uploads={uploads} />
    </div>
  </div>
}
