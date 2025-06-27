import {useState} from 'react'

import {Alert} from 'libraries/dialog'
import {Button} from 'libraries/ui'
import {useT} from 'i18n'

interface DeleteButtonProps {
  className?: string
  text: string
  disabled?: boolean
  onDelete: () => unknown
  confirmText: string
  minimal?: boolean
}

export function DeleteButton({onDelete, disabled, minimal, className, text, confirmText} : DeleteButtonProps) {
  const t = useT('components.deleteButton')
  const [showDialog, setShowDialog] = useState(false)
  return <>
    <Button minimal={minimal} className={className} icon="trash" text={text} disabled={disabled} color="danger" onClick={() => setShowDialog(true)}/>
    <Alert title={text} isOpen={showDialog} onClose={() => setShowDialog(false)}
      onConfirm={onDelete}
      intent="danger"
      cancelButtonText={t('cancel')}
      confirmButtonText={t('delete')}>
      {confirmText}
    </Alert>
  </>
}
