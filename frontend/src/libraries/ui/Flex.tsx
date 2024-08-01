import React from 'react'
import classnames from 'classnames'

import './Flex.sass'

interface FlexProps extends React.ComponentProps<'div'> {
  alignItems?: 'stretch' | 'start' | 'end' | 'center'
  justify?: 'space-between' | 'start' | 'end' | 'center'
  wrap?: boolean
  column?: boolean
  spaced?: boolean
}

export function Flex({children, justify = 'start', alignItems = 'stretch', wrap, column, spaced, className, ...props} : FlexProps) {
  const cls = classnames(
    'flex',
    'flex-justify-content-'+justify,
    'flex-align-items-'+alignItems,
    wrap && 'flex-wrap',
    column && 'flex-column',
    spaced && 'flex-spaced',
    className
  )
  return <div className={cls} {...props}>{children}</div>
}
