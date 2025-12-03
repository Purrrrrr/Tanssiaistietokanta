import { useState } from 'react'
import { Edit } from '@blueprintjs/icons'

import { UploadedFile, useRenameFile } from 'services/files'

import { TextInput } from 'libraries/formsV2/components/inputs'
import { Dialog } from 'libraries/overlays'
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
    <Dialog
      isOpen={name !== null}
      onClose={() => setName(null)}
      title={t('components.files.RenameFileButton.text')}
      showCloseButton={false}
    >
      <form onSubmit={e => {
        console.log(e)
        e.preventDefault()
        if (name) {
          renameFile({ id: file._id, name })
          setName(null)
        }
      }}>
        <Dialog.Body>
          <TextInput className="w-100!" id="name" value={name} onChange={setName} onKeyDown={() => { /* Override default keydown blur */ }} />
        </Dialog.Body>
        <Dialog.Footer className="flex flex-row-reverse">
          <Button color="primary" type="submit" text={t('components.files.RenameFileButton.ok')} />
          <Button text={t('common.cancel')} onClick={() => setName(null)} />
        </Dialog.Footer>
      </form>
    </Dialog>
  </>
}
