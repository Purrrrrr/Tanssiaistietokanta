import { UploadedFile, useDeleteFile } from 'services/files'

import { DeleteButton } from 'components/widgets/DeleteButton'
import { useT } from 'i18n'

export function DeleteSelectionButton({ files }: {
  files: UploadedFile[]
}) {
  const T = useT('components.files.DeleteSelectionButton')
  const [deleteFile] = useDeleteFile()
  return <DeleteButton
    text={T('text')}
    confirmTitle={T('confirmTitle', { count: files.length })}
    confirmText={T('confirmText', { filenames: files.map(file => file.name).join(', ') })}
    onDelete={() => Promise.all(files.map(file => deleteFile({ id: file._id })))}
  />
}
