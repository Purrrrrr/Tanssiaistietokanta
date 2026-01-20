import React, { useEffect, useLayoutEffect, useRef } from 'react'
import classNames from 'classnames'

import { useShouldRender } from 'libraries/common/useShouldRender'
import { Button } from 'libraries/ui'
import { Cross } from 'libraries/ui/icons'

export type DialogProps = {
  isOpen: boolean
  onClose?: (e: React.SyntheticEvent) => unknown
  title: string
  // style ?: React.CSSProperties
  children: React.ReactNode
  className?: string
} & DialogCloseButtonProps

export type DialogCloseButtonProps = (
  {
    showCloseButton?: true
    closeButtonLabel: string
  } | {
    showCloseButton: false
    closeButtonLabel?: string
  }
)

export function Dialog({ isOpen, onClose, children, title, className, showCloseButton = true, closeButtonLabel }: DialogProps) {
  const modal = useRef<HTMLDialogElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const shouldrender = useShouldRender(isOpen, 600)

  useLayoutEffect(() => {
    if (isOpen) {
      modal.current?.showModal()
    } else {
      modal.current?.close()
    }
  }, [isOpen])
  useEffect(
    () => {
      if (!isOpen || modal.current === null) return
      if (modal.current.contains(document.activeElement)) return

      const focusables = getFocusableElements(modal.current).filter(el => el !== closeButton.current)
      focusables[0]?.focus()
    },
    [isOpen],
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
        <div className="flex justify-between items-center p-2 mb-3 bg-gray-50 border-gray-300 border-b-1">
          <h1 className="text-base reset">{title}</h1>
          {showCloseButton && <Button aria-label={closeButtonLabel} minimal onClick={onClose} ref={closeButton}><Cross /></Button>}
        </div>
        <div className="overflow-auto max-h-[90dvh]">
          {children}
        </div>
      </>
    }
  </dialog>
}

Dialog.Body = function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={classNames(className, 'px-3 break-words')} {...props} />
}
Dialog.Footer = function DialogFooter({ className = 'flex gap-3 justify-between items-center', ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={classNames(className, 'bg-gray-50 mt-3 px-3 py-2 border-t-1 border-gray-300')} {...props} />
}

export function getFocusableElements(container: HTMLElement) {
  return [
    ...container.querySelectorAll(focusableSelector) as NodeListOf<HTMLElement>,
  ].filter(el => !el.getAttribute('aria-hidden') && el.style.display !== 'none')
}

const focusableSelector = 'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), details, iframe, object, embed, [contenteditable], [tabindex]:not([tabindex="-1"])'
