import React from 'react';
import classnames from 'classnames';

import './Flex.sass';

interface FlexProps extends React.ComponentProps<"div"> {
  alignItems?: "stretch" | "start" | "end"
  column?: boolean
  addSpacing?: boolean
}

export function Flex({children, alignItems = "stretch", column, addSpacing, className, ...props} : FlexProps) {
  const cls = classnames(
    "flex",
    "flex-align-items-"+alignItems,
    column && "flex-column",
    addSpacing && "flex-spaced",
    className
  )
  return <div className={cls} {...props}>{children}</div>
}
