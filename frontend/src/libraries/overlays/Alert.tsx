import React from 'react'

import { Button, ButtonProps } from 'libraries/ui'

import { Dialog } from './Dialog'

export interface AlertProps {
  title: string
  children: React.ReactNode
  button?: AlertAction
  buttons?: AlertAction[]
  isOpen: boolean
  onClose(): void
  onChoose?(action: AlertAction): void
}

export type AlertAction = string | ActionProps

interface ActionProps extends Pick<ButtonProps, 'icon' | 'color'> {
  id?: string
  text: string
  action?(): unknown
}

export function Alert({ children, button, buttons, onClose, onChoose, ...rest }: AlertProps) {
  const buttonProps: ButtonProps[] = [button, ...buttons ?? []]
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
      {buttonProps.map((props, i) => <Button key={props.id ?? i} {...props} />)}
    </Dialog.Footer>
  </Dialog>
}
