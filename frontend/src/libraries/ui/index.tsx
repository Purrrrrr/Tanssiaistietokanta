import React from 'react'
import classNames from 'classnames'

import { ColorClass, CssClass } from './classes'

import './ui.css'

export * from './AutosizedSection'
export { Breadcrumb, BreadcrumbContext, Breadcrumbs } from './Breadcrumbs'
export { AnchorButton, type AnchorButtonProps, Button, buttonClass, type ButtonProps } from './Button'
export { Callout } from './Callout'
export { default as Collapse } from './Collapse'
export { FormGroup, type FormGroupProps } from './FormGroup'
export { GlobalSpinner } from './GlobalLoadingSpinner'
export { ItemList, type Sort } from './ItemList'
export { Link, RegularLink } from './Link'
export { LoadingSpinner } from './LoadingSpinner'
export { SearchBar } from './SearchBar'
export { Tab, Tabs } from './Tabs'
export * from './toaster'
export type { Color } from './types'
export { useResizeObserver } from './utils/useResizeObserver'

export const Markdown = React.lazy(() => import('./Markdown'))

export { ColorClass, CssClass }

type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>

interface CardProps extends Omit<HTMLDivProps, 'onClick'> {
  noPadding?: boolean
  marginClass?: string
}

export function H2({ children, className }: { children: React.ReactNode, className?: string }) {
  return <h2 className={classNames(className ?? 'my-4', 'font-bold text-lg')}>{children}</h2>
}

export function Card({ className, noPadding = false, marginClass, ...props }: CardProps) {
  return <div
    {...props}
    className={classNames(
      'border-1 border-gray-200 shadow-gray-300 shadow-xs',
      noPadding || 'p-6',
      marginClass ?? 'my-2',
      className,
    )}
  />
}
