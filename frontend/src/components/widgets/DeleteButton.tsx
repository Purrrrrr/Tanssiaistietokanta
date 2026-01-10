import { Trash } from 'libraries/ui/icons'

import { useAlerts } from 'libraries/overlays'
import { Button, ButtonProps } from 'libraries/ui'
import { useT } from 'i18n'

interface DeleteButtonProps extends ButtonProps {
  text: string
  iconOnly?: boolean
  disabled?: boolean
  onDelete: () => unknown
  confirmText: React.ReactNode
  confirmTitle?: string
  minimal?: boolean
}

export function DeleteButton({ onDelete, iconOnly, text, confirmTitle, confirmText, ...props }: DeleteButtonProps) {
  const t = useT('components.deleteButton')
  const showAlert = useAlerts()

  return <Button
    {...props}
    icon={<Trash />}
    text={iconOnly ? undefined : text}
    aria-label={text}
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
