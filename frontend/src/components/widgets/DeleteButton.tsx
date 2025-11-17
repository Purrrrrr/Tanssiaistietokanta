import { Trash } from '@blueprintjs/icons'

import { useAlerts } from 'libraries/overlays'
import { Button, ButtonProps } from 'libraries/ui'
import { useT } from 'i18n'

interface DeleteButtonProps extends ButtonProps {
  text: string
  iconOnly?: boolean
  disabled?: boolean
  onDelete: () => unknown
  confirmText: string
  confirmTitle?: string
  minimal?: boolean
}

export function DeleteButton({ onDelete, iconOnly, disabled, minimal, className, text, confirmTitle, confirmText }: DeleteButtonProps) {
  const t = useT('components.deleteButton')
  const showAlert = useAlerts()

  return <Button
    minimal={minimal}
    className={className}
    icon={<Trash />}
    text={iconOnly ? undefined : text}
    aria-label={text}
    disabled={disabled}
    color="danger"
    onClick={() => showAlert({
      title: confirmTitle ?? text,
      buttons: [
        {
          text: t('delete'),
          color: 'danger',
          action: onDelete,
        },
        t('cancel'),
      ],
      children: confirmText,
    })}
  />
}
