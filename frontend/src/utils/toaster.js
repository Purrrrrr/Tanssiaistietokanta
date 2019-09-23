import {Toaster} from "@blueprintjs/core";

/** Singleton toaster instance.  */
export const toaster = Toaster.create();

export function showToast(args) {
  return toaster.show(args);
}
