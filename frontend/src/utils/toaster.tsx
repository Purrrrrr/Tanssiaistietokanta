import React from 'react'
import {IToaster, IToastProps, Toaster } from '@blueprintjs/core'

/** Singleton toaster instance.  */
let toaster : IToaster | null

export function ToastContainer() {
  return <section aria-live="assertive">
    <Toaster usePortal={false} ref={t => toaster = t}/>
  </section>
}

export function showToast(args : IToastProps) {
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
