import React, {useState} from 'react'

import {Alert} from 'libraries/dialog'
import {Button} from 'libraries/ui'
import {useT} from 'i18n'

interface DeleteButtonProps {
  style?: React.CSSProperties
  text: string
  disabled?: boolean
  onDelete: () => unknown
  confirmText: string
}

export function DeleteButton({onDelete, disabled, style, text, confirmText} : DeleteButtonProps) {
  const t = useT('components.deleteButton')
  const [showDialog, setShowDialog] = useState(false)
  return <>
    <Button style={style} icon="trash" text={text} disabled={disabled} intent="danger" onClick={() => setShowDialog(true)}/>
    <Alert title={text} isOpen={showDialog} onClose={() => setShowDialog(false)}
      onConfirm={onDelete}
      intent="danger"
      cancelButtonText={t('cancel')}
      confirmButtonText={t('delete')}>
      {confirmText}
    </Alert>
  </>
}
