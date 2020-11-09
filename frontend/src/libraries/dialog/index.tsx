import React, {useEffect, useRef, useCallback} from 'react';
import {IAlertProps, Button, Overlay, Classes} from "@blueprintjs/core";
import { FocusScope, useFocusManager } from '@react-aria/focus';

interface DialogProps extends InnerDialogProps {
  isOpen: boolean,
}

export function Dialog({isOpen, onClose, ...props} : DialogProps) {
  return <Overlay isOpen={isOpen} lazy onClose={onClose} enforceFocus={false} canOutsideClickClose={true} className={Classes.OVERLAY_SCROLL_CONTAINER} hasBackdrop={true}>
    <div className={Classes.DIALOG_CONTAINER}>
      <FocusScope contain restoreFocus>
        <InnerDialog {...props} onClose={onClose} />
      </FocusScope>
    </div>
  </Overlay>
}

interface InnerDialogProps {
  onClose?: (e: any) => any
  title: string
  style ?: any
  children: React.ReactNode
  className?: string,
  showCloseButton ?: boolean
}
function InnerDialog({children, onClose, title, style, className, showCloseButton = true} : InnerDialogProps) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const focusManager = useFocusManager();

  useEffect(
    () => {focusManager.focusNext({
      from: closeButton.current || undefined, wrap: true
    })},
    [focusManager]
  )

  return <div className={Classes.DIALOG+(className ? " "+className : '')} style={style}>
    <div className={Classes.DIALOG_HEADER}>
      <h1 style={{fontSize: 18}} className={Classes.HEADING}>{title}</h1>
      {showCloseButton && <button aria-label="Close" className={Classes.BUTTON+" "+Classes.DIALOG_CLOSE_BUTTON+" "+Classes.MINIMAL} onClick={onClose} ref={closeButton}>❌</button>}
    </div>
    {children}
  </div>
}

export function Alert({isOpen, title, intent, confirmButtonText, cancelButtonText, children, onCancel, onConfirm, onClose} : IAlertProps & {children: React.ReactNode, title: string}) {
  const doCancel = useCallback((e) => {onCancel && onCancel(); onClose && onClose(false, e);}, [onCancel, onClose]);
  const doConfirm = useCallback((e) => {onConfirm && onConfirm(); onClose && onClose(true, e);}, [onConfirm, onClose]);

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
