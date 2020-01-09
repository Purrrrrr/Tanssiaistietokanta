import React from 'react';
import {AnchorButton} from "@blueprintjs/core";
import {NavigateProvider} from "./NavigateProvider"

export function NavigateButton({href, target, ...props}) {
  if (target) return <AnchorButton href={href} target={target} {...props} />;

  return <NavigateProvider>
    {navigate => <AnchorButton href={href} {...props} onClick={(e) => {e.preventDefault(); navigate(href);}} />}
  </NavigateProvider>
}
