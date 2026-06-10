import { AlertProps } from './types'

import { Button, ButtonProps } from '../Button'
import { Dialog } from '../overlays/Dialog'

interface KeyedButtonProps extends ButtonProps {
  key: string | number
}

export function Alert({ children, button, buttons, onClose, onChoose, ...rest }: AlertProps) {
  const buttonProps: KeyedButtonProps[] = [button, ...buttons ?? []]
    .filter(action => action !== undefined)
    .map((actionSpec, index) => {
      const color = index === 0 ? 'primary' : 'none'
      if (typeof actionSpec === 'string') {
        return {
          color,
          text: actionSpec,
          key: index,
          onClick: () => { onChoose?.(actionSpec); onClose() },
        }
      }
      const { action, id, ...rest } = actionSpec
      return {
        color,
        ...rest,
        key: id ?? index,
        onClick: () => {
          action?.()
          onChoose?.(actionSpec)
          onClose()
        },
      }
    })

  return <Dialog onClose={() => {}} {...rest} showCloseButton={false}>
    <Dialog.Body>
      {children}
    </Dialog.Body>
    <Dialog.Footer className="flex flex-row-reverse">
      {buttonProps.map((props) => <Button {...props} key={props.key} />)}
    </Dialog.Footer>
  </Dialog>
}
