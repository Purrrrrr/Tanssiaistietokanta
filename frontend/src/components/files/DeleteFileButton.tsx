import { UploadedFile, useDeleteFile } from 'services/files'

import { DeleteButton } from 'components/widgets/DeleteButton'
import { useT } from 'i18n'

export function DeleteFileButton({ file }: {
  file: UploadedFile
}) {
  const T = useT('components.files.DeleteFileButton')
  const [deleteFile] = useDeleteFile()
  return <DeleteButton
    minimal
    text={T('text')}
    confirmTitle={T('confirmTitle')}
    confirmText={T('confirmText', { filename: file.name })}
    onDelete={() => deleteFile({ id: file._id })}
  />
}
