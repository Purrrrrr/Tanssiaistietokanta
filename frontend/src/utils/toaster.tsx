import React from 'react'
import {OverlayToaster, Toaster, ToastProps } from '@blueprintjs/core'

/** Singleton toaster instance.  */
let toaster : Toaster | null

export function ToastContainer() {
  return <section aria-live="assertive">
    <OverlayToaster usePortal={false} ref={t => toaster = t}/>
  </section>
}

export function showToast(args : ToastProps) {
  return toaster ? toaster.show(args) : console.error('Cannot show toast: ', args.message)
}

export function showDefaultErrorToast(e : {message: string}) {
  showToast({
    intent: 'danger',
    message: `Tietojen tallennus epäonnistui :( Syy: ${e.message}`,
    isCloseButtonShown: true,
    timeout: 30000,
  })
}
