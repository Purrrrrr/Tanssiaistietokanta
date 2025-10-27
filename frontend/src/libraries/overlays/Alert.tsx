import React, { useCallback } from 'react'

import { Button, Color } from 'libraries/ui'

import { Dialog } from './Dialog'

interface AlertProps {
  cancelButtonText?: string
  children: React.ReactNode
  confirmButtonText?: string
  title: string
  color?: Color
  isOpen: boolean
  onCancel?(evt?: React.SyntheticEvent<HTMLElement>): void
  onConfirm?(evt?: React.SyntheticEvent<HTMLElement>): void
  onClose?(confirmed: boolean, evt?: React.SyntheticEvent<HTMLElement>): void
}

export function Alert({ isOpen, title, color, confirmButtonText, cancelButtonText, children, onCancel, onConfirm, onClose }: AlertProps & { children: React.ReactNode, title: string }) {
  const doCancel = useCallback((e) => {
    onCancel?.()
    onClose?.(false, e)
  }, [onCancel, onClose])
  const doConfirm = useCallback((e) => {
    onConfirm?.()
    onClose?.(true, e)
  }, [onConfirm, onClose])

  return <Dialog isOpen={isOpen} title={title} onClose={doCancel} showCloseButton={false}>
    <Dialog.Body>
      {children}
    </Dialog.Body>
    <Dialog.Footer className="flex flex-row-reverse">
      <Button color={color} text={confirmButtonText} onClick={doConfirm} />
      {cancelButtonText && <Button text={cancelButtonText} onClick={doCancel} />}
    </Dialog.Footer>
  </Dialog>
}
