import { UploadedFile, useDeleteFile } from 'services/files'

import { showToast } from 'libraries/ui'
import { DeleteButton } from 'components/widgets/DeleteButton'
import { useT } from 'i18n'

export function DeleteSelectionButton({ files }: {
  files: UploadedFile[]
}) {
  const T = useT('components.files.DeleteSelectionButton')
  const [deleteFile] = useDeleteFile()

  const deleteFiles = async () => {
    await Promise.all(files.map(file => deleteFile({ id: file._id })))
    showToast({
      color: 'danger',
      message: T('successMessage', { count: files.length }),
    })
  }

  return <DeleteButton
    text={T('text')}
    confirmTitle={T('confirmTitle', { count: files.length })}
    confirmText={<>
      <p>{T('confirmText')}</p>
      <ul>
        {files.map(file => <li className="list-disc list-inside list-item" key={file._id}>{file.name}</li>)}
      </ul>
    </>}
    onDelete={deleteFiles}
  />
}
