import React from 'react';
import {Link} from "@reach/router"
import {Classes} from "@blueprintjs/core"
import classNames from "classnames";

export function NavigateButton({text, disabled, href, intent, className, ...props}) {
  const classes = classNames(
    Classes.BUTTON,
    {[Classes.DISABLED]: disabled},
    Classes.intentClass(intent),
    className
  )
  const onClick = props.onClick ??
    (props.target ==='_blank' ? openLinkWithTarget : undefined);

  return <Link {...props} className={classes} role="button"
    tabIndex={0} to={href} onClick={onClick}>
    {text}
  </Link>;
}

function openLinkWithTarget(e) {
  e.preventDefault();
  window.open(e.target.href);
}
