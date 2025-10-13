import { useState } from 'react'
import { Trash } from '@blueprintjs/icons'

import { Alert } from 'libraries/overlays'
import { Button, ButtonProps } from 'libraries/ui'
import { useT } from 'i18n'

interface DeleteButtonProps extends ButtonProps {
  text: string
  iconOnly?: boolean
  disabled?: boolean
  onDelete: () => unknown
  confirmText: string
  minimal?: boolean
}

export function DeleteButton({ onDelete, iconOnly, disabled, minimal, className, text, confirmText }: DeleteButtonProps) {
  const t = useT('components.deleteButton')
  const [showDialog, setShowDialog] = useState(false)
  return <>
    <Button
      minimal={minimal}
      className={className}
      icon={<Trash />}
      text={iconOnly ? undefined : text}
      aria-label={text}
      disabled={disabled}
      color="danger"
      onClick={() => setShowDialog(true)}
    />
    <Alert
      title={text}
      isOpen={showDialog}
      onClose={() => setShowDialog(false)}
      buttons={[
        {
          text: t('delete'),
          color: 'danger',
          action: onDelete,
        },
        t('cancel'),
      ]}
    >
      {confirmText}
    </Alert>
  </>
}
