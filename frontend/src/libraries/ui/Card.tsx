import React from 'react'
import classNames from 'classnames'

type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>

interface CardProps extends Omit<HTMLDivProps, 'onClick'> {
  noPadding?: boolean
  marginClass?: string
}

export function Card({ className, noPadding = false, marginClass, ...props }: CardProps) {
  return <div
    {...props}
    className={classNames(
      'bg-white border-1 border-gray-200 shadow-gray-300 shadow-xs',
      noPadding || 'p-6',
      marginClass ?? 'mb-4',
      className,
    )}
  />
}
