import { useState } from 'react'
import { Edit } from '@blueprintjs/icons'

import { UploadedFile, useRenameFile } from 'services/files'

import { TextInput } from 'libraries/formsV2/components/inputs'
import { Alert } from 'libraries/overlays'
import { Button } from 'libraries/ui'
import { useT } from 'i18n'

export function RenameFileButton({ file }: {
  file: UploadedFile
}) {
  const t = useT('')
  const [name, setName] = useState<null | string>(null)
  const [renameFile] = useRenameFile()

  return <>
    <Button
      minimal
      icon={<Edit />}
      color="primary"
      text={t('components.files.RenameFileButton.text')}
      onClick={() => setName(file.name)}
    />
    <Alert
      isOpen={name !== null}
      onClose={() => setName(null)}
      title={t('components.files.RenameFileButton.text')}
      buttons={[
        {
          text: t('components.files.RenameFileButton.ok'),
          action: () => name && renameFile({ id: file._id, name }),
        },
        t('common.cancel'),
      ]}
    >
      <TextInput className="w-100!" id="name" value={name} onChange={setName} />
    </Alert>
  </>
}
