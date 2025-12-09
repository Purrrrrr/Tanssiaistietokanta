import { useState } from 'react'
import { Edit } from '@blueprintjs/icons'

import { UploadedFile, useRenameFile } from 'services/files'

import { TextInput } from 'libraries/formsV2/components/inputs'
import { Dialog, useAlerts } from 'libraries/overlays'
import { Button } from 'libraries/ui'
import { Translator, useT } from 'i18n'

export function RenameFileButton({ file }: {
  file: UploadedFile
}) {
  const t = useT('')
  const [name, setName] = useState<null | string>(null)
  const [renameFile] = useRenameFile({
    onCompleted: () => setName(null),
    onError: err => {
      showAlert({
        title: t('components.files.RenameFileButton.errorTitle'),
        children: getError(err.cause, t),
        button: t('components.files.RenameFileButton.ok'),
      })
    },
  })
  const showAlert = useAlerts()

  return <>
    <Button
      minimal
      icon={<Edit />}
      color="primary"
      text={t('components.files.RenameFileButton.text')}
      onClick={() => setName(file.name)}
    />
    <Dialog
      isOpen={name !== null}
      onClose={() => setName(null)}
      title={t('components.files.RenameFileButton.text')}
      showCloseButton={false}
    >
      <form onSubmit={e => {
        e.preventDefault()
        if (name) {
          renameFile({ id: file._id, name })
        }
      }}>
        <Dialog.Body>
          <TextInput className="w-100!" id="name" value={name} onChange={setName} onKeyDown={() => { /* Override default keydown blur */ }} />
        </Dialog.Body>
        <Dialog.Footer className="flex flex-row-reverse">
          <Button color="primary" type="submit" text={t('components.files.RenameFileButton.rename')} />
          <Button text={t('common.cancel')} onClick={() => setName(null)} />
        </Dialog.Footer>
      </form>
    </Dialog>
  </>
}

function getError(e: unknown, t: Translator<''>): string {
  if (typeof e !== 'object' || e === null) {
    return String(e)
  }

  if ('code' in e && e.code === 'FILE_EXISTS') {
    return t('components.files.RenameFileButton.duplicateError')
  }
  return JSON.stringify(e)
}
