import React from 'react';
import classnames from 'classnames';

import './Flex.sass';

interface FlexProps extends React.ComponentProps<"div"> {
  alignItems?: "stretch" | "start" | "end" | "center"
  wrap?: boolean
  column?: boolean
  spaced?: boolean
}

export function Flex({children, alignItems = "stretch", wrap, column, spaced, className, ...props} : FlexProps) {
  const cls = classnames(
    "flex",
    "flex-align-items-"+alignItems,
    wrap && "flex-wrap",
    column && "flex-column",
    spaced && "flex-spaced",
    className
  )
  return <div className={cls} {...props}>{children}</div>
}
