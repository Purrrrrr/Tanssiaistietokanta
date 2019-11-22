import {Toaster, Intent} from "@blueprintjs/core";

/** Singleton toaster instance.  */
export const toaster = Toaster.create();

export function showToast(args) {
  return toaster.show(args);
}

export function showDefaultErrorToast(e) {
  showToast({
    intent: Intent.DANGER,
    message: `Tietojen tallennus epäonnistui :( Syy: ${e.message}`
  });
}
