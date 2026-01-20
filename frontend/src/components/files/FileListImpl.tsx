import { useRef } from 'react'

import { FileOwner, FileOwningId } from 'types/files'

import { useFiles } from 'services/files'

import { useRights } from 'libraries/access-control'
import { useFormatDateTime } from 'libraries/i18n/dateTime'
import { useAlerts } from 'libraries/overlays'
import { Button, H2, ItemList, RegularLink } from 'libraries/ui'
import { Add } from 'libraries/ui/icons'
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

export interface FileListProps {
  title?: string
  owner: FileOwner
  owningId: FileOwningId
  path?: string
}

/** The actual non-lazy-loaded implementation of FileList */
export default function FileList({ title, owner, owningId, path }: FileListProps) {
  const input = useRef<HTMLInputElement>(null)
  const queryVars = { owner, owningId, path }
  const [files] = useFiles(queryVars)
  const [doUpload, uploads] = useUploadQueue(owner, owningId, path)
  const filesize = useFilesize()
  const T = useT('components.files')
  const formatDate = useFormatDateTime()
  const showAlert = useAlerts()
  const selector = useMultipleSelection(files)
  const [canUseFiles, canUpload, canModify, canDelete] = useRights([
    'files:read', 'files:create', 'files:modify', 'files:delete',
  ])

  const startUploads = async (filesToUpload: File[]) => {
    if (!canUpload) return
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

  if (!canUseFiles) {
    return null
  }

  return <div>
    {title && <H2>{title}</H2>}
    <FileDropZone enabled={canUpload} onDrop={onDragAndDrop}>
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
              {canModify && <RenameFileButton file={file} />}
              {canDelete && <DeleteFileButton file={file} />}
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
      {canUpload && <Button icon={<Add />} onClick={() => input.current?.click()} text={T('addFile')} />}
      {selector.selected.length > 0 &&
        <div className="flex gap-3 items-center">
          {T('filesSelected', {
            count: selector.selected.length,
            sizeTotal: filesize(selector.selected.map(file => file.size).reduce((a, b) => a + b)),
          })}
          {canDelete && <DeleteSelectionButton files={selector.selected} />}
          <DownloadSelectionButton files={selector.selected} />
        </div>
      }
      <UploadProgressList uploads={uploads} />
    </div>
  </div>
}
