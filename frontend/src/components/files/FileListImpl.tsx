import { useRef } from 'react'

import { FileOwner, FileOwningId } from 'types/files'

import { useFiles } from 'services/files'

import { useRights } from 'libraries/access-control'
import { useMultipleSelection } from 'libraries/common/selection/useMultipleSelection'
import { useFormatDateTime } from 'libraries/i18n/dateTime'
import { ItemList2, PageSection, RegularLink } from 'libraries/ui'
import { useShowAlert } from 'libraries/ui/hooks'
import { AddButton } from 'components/widgets/AddButton'
import { useT } from 'i18n'

import { DeleteFileButton } from './DeleteFileButton'
import { DeleteSelectionButton } from './DeleteSelectionButton'
import { DownloadSelectionButton } from './DownloadSelectionButton'
import { FileDropZone } from './FileDropZone'
import { RenameFileButton } from './RenameFileButton'
import { UploadProgressList } from './UploadProgres'
import useFilesize from './useFilesize'
import { useUploadQueue } from './useUploadQueue'

export interface FileListProps {
  title: string
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
  const showAlert = useShowAlert()
  const selector = useMultipleSelection(files)
  const [canUseFiles, canUpload, canModify, canDelete] = useRights([
    'files:read', 'files:create', 'files:modify', 'files:delete',
  ], { owner, owningId })

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

  return <PageSection
    title={title}
    toolbar={<>
      {canUpload && <AddButton onClick={() => input.current?.click()} text={T('addFile')} />}
      {selector.selected.length > 0 &&
        <div className="flex gap-2 items-center">
          <span className="ms-3">
            {T('filesSelected', {
              count: selector.selected.length,
              sizeTotal: filesize(selector.selected.map(file => file.size).reduce((a, b) => a + b)),
            })}
          </span>
          {canDelete && <DeleteSelectionButton files={selector.selected} />}
          <DownloadSelectionButton files={selector.selected} />
        </div>
      }

    </>}
  >
    <UploadProgressList uploads={uploads} />
    <FileDropZone enabled={canUpload} onDrop={onDragAndDrop}>
      <ItemList2
        items={files}
        emptyText={T('noFiles')}
        selection={selector}
        labelTranslator={T}
        columns={[
          {
            key: 'name',
            width: '1fr',
            content: file => <RegularLink href={`/api/files/${file._id}?download=true`} target="_blank" title={file.name} className="overflow-hidden text-ellipsis">
              {file.name}
            </RegularLink>,
          }, {
            key: 'date',
            width: 'minmax(200px, auto)',
            content: file => formatDate(file._updatedAt),
            sortBy: '_updatedAt',
          }, {
            key: 'size',
            width: 'minmax(100px, auto)',
            content: file => filesize(file.size),
          },
        ]}
        actions={file => <>
          {canModify && <RenameFileButton file={file} />}
          {canDelete && <DeleteFileButton file={file} />}
        </>}
      />
      <input
        className="hidden"
        ref={input}
        type="file"
        multiple
        onChange={e => e.target.files && startUploads([...e.target.files])}
      />
    </FileDropZone>
  </PageSection>
}
