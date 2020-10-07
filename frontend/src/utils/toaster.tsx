import React from 'react';
import {Toaster, IToaster, IToastProps, Intent} from "@blueprintjs/core";

/** Singleton toaster instance.  */
let toaster : IToaster;

export function ToastContainer() {
  return <section aria-live="assertive">
    <Toaster usePortal={false} ref={t => toaster = t!}/>
  </section>
}

export function showToast(args : IToastProps) {
  return toaster.show(args);
}

export function showDefaultErrorToast(e : {message: string}) {
  showToast({
    intent: Intent.DANGER,
    message: `Tietojen tallennus epäonnistui :( Syy: ${e.message}`
  });
}
