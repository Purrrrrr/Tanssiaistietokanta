import { UploadedFile } from 'services/files'

import { AnchorButton } from 'libraries/ui'
import { useTranslation } from 'i18n'

export function DownloadSelectionButton({ files }: {
  files: UploadedFile[]
}) {
  const query = files.map(file => `_id[$in][]=${file._id}`).join('&')

  return <AnchorButton
    text={useTranslation('components.files.downloadSelected')}
    color="primary"
    target="_blank"
    href={`/api/files/?${query}&download=true`}
  />
}
