import React, {useState} from 'react'

import {Alert} from 'libraries/dialog'
import {Button} from 'libraries/ui'

interface DeleteButtonProps {
  style?: React.CSSProperties
  text: string
  onDelete: () => unknown
  confirmText: string
}

export function DeleteButton({onDelete, style, text, confirmText} : DeleteButtonProps) {
  const [showDialog, setShowDialog] = useState(false)
  return <>
    <Button style={style} icon="trash" text={text} intent="danger" onClick={() => setShowDialog(true)}/>
    <Alert title={text} isOpen={showDialog} onClose={() => setShowDialog(false)}
      onConfirm={onDelete}
      intent="danger"
      cancelButtonText="Peruuta"
      confirmButtonText="Poista">
      {confirmText}
    </Alert>
  </>
}
