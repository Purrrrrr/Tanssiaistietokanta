import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from 'react'
import {AlertProps, Classes} from '@blueprintjs/core'
import classNames from 'classnames'

import {Button} from 'libraries/ui'

type DialogProps = {
  isOpen: boolean,
  onClose?: (e: React.SyntheticEvent) => unknown
  title: string
  // style ?: React.CSSProperties
  children: React.ReactNode
  className?: string,
} & (
  {
    showCloseButton?: true
    closeButtonLabel: string
  } | {
    showCloseButton: false
    closeButtonLabel?: string
  }
)

export function Dialog({isOpen, onClose, children, title, className, showCloseButton = true, closeButtonLabel} : DialogProps) {
  const modal = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const [shouldrender, setShouldRender] = useState(false)

  useLayoutEffect(() => {
    if (isOpen) {
      modal.current?.showModal()
      setShouldRender(true)
    } else {
      modal.current?.close()
      const id = setTimeout(() => setShouldRender(false), 600)
      return () => clearTimeout(id)
    }
  }, [isOpen])
  useEffect(
    () => {
      if (!isOpen || modal.current === null) return
      if (modal.current.contains(document.activeElement)) return

      const focusables = getFocusableElements(modal.current).filter(el => el !== closeButton.current)
      focusables[0]?.focus()
    },
    [isOpen]
  )

  return <dialog
    ref={modal}
    className={classNames(
      className,
      'block overflow-hidden fixed top-1/2 -translate-y-1/2 mx-auto bg-gray-100 rounded-md border border-gray-400 shadow-xl shadow-black/50 transition-opacity duration-200',
      '[[open]]:animate-appear [[open]]:opacity-100',
      'animate-dissapear opacity-0',
      'backdrop:backdrop-blur-[2px]',
    )}
  >
    {(isOpen || shouldrender) &&
      <>
        <div className={Classes.DIALOG_HEADER}>
          <h1 style={{fontSize: 18}} className={Classes.HEADING}>{title}</h1>
          {showCloseButton && <button aria-label={closeButtonLabel} className={Classes.BUTTON+' '+Classes.DIALOG_CLOSE_BUTTON+' '+Classes.MINIMAL} onClick={onClose} ref={closeButton}>❌</button>}
        </div>
        <div className="overflow-auto max-h-[90dvh]">
          {children}
        </div>
      </>
    }
  </dialog>
}

Dialog.Body = function DialogBody({className, ...props}: React.HTMLAttributes<HTMLDivElement>) {
  const cls = `${className ?? ''} ${Classes.DIALOG_BODY}`
  return <div className={cls} {...props} />
}
Dialog.Footer = function DialogBody({className, ...props}: React.HTMLAttributes<HTMLDivElement>) {
  const cls = `${className ?? ''} ${Classes.DIALOG_FOOTER}`
  return <div className={cls} {...props} />
}

export function Alert({isOpen, title, intent, confirmButtonText, cancelButtonText, children, onCancel, onConfirm, onClose} : AlertProps & {children: React.ReactNode, title: string}) {
  const doCancel = useCallback((e) => {onCancel?.(); onClose?.(false, e)}, [onCancel, onClose])
  const doConfirm = useCallback((e) => {onConfirm?.(); onClose?.(true, e)}, [onConfirm, onClose])

  return <Dialog isOpen={isOpen} title={title} onClose={doCancel} showCloseButton={false}>
    <div className={Classes.DIALOG_BODY}>
      <div className={Classes.ALERT_CONTENTS}>{children}</div>
    </div>
    <div className={Classes.DIALOG_FOOTER}>
      <div className={Classes.ALERT_FOOTER}>
        <Button intent={intent} text={confirmButtonText} onClick={doConfirm} />
        {cancelButtonText && <Button text={cancelButtonText} onClick={doCancel} />}
      </div>
    </div>
  </Dialog>
}

export function getFocusableElements(container: HTMLElement) {
  return [
    ...container.querySelectorAll(focusableSelector) as NodeListOf<HTMLElement>
  ].filter(el => !el.getAttribute('aria-hidden') && el.style.display !== 'none')
}

const focusableSelector = 'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), details, iframe, object, embed, [contenteditable], [tabindex]:not([tabindex="-1"])'
