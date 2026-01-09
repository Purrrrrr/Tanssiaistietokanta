import React from 'react'
import {
  FormGroup as BlueprintFormGroup,
  FormGroupProps as BlueprintFormGroupProps,
} from '@blueprintjs/core'
import classNames from 'classnames'

import { Color } from './types'

import { ColorClass, CssClass } from './classes'

import './ui.css'

export * from './AutosizedSection'
export { Breadcrumb, BreadcrumbContext, Breadcrumbs } from './Breadcrumbs'
export { AnchorButton, type AnchorButtonProps, Button, buttonClass, type ButtonProps } from './Button'
export { Callout } from './Callout'
export { default as Collapse } from './Collapse'
export { GlobalSpinner } from './GlobalLoadingSpinner'
export { ItemList, type Sort } from './ItemList'
export { Link, RegularLink } from './Link'
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

export interface FormGroupProps extends Omit<BlueprintFormGroupProps, 'inline' | 'intent'>, React.ComponentPropsWithoutRef<'div'> {
  elementRef?: React.Ref<HTMLDivElement>
  inline?: boolean
  labelStyle?: 'above' | 'beside'
  children?: React.ReactNode
  color?: Color
}

const FormGroupInstance = new BlueprintFormGroup({})

export function FormGroup({ elementRef, className, inline, labelStyle: maybeLabelStyle, ...props }: FormGroupProps) {
  const labelStyle = maybeLabelStyle ?? (inline ? 'beside' : 'above')
  const inlineLabel = labelStyle === 'beside'
  const inlineProps = inline
    ? { inline: true, className: classNames(CssClass.formGroupInline, className) }
    : { inline: inlineLabel, className: classNames(inlineLabel && CssClass.formGroupInlineFill, className) }

  const {
    color, children, disabled, contentClassName, helperText, label, labelFor, labelInfo, style, subLabel,
    ...rest
  } = props
  // @ts-expect-error Props is readonly, but we override it here
  FormGroupInstance.props = {
    intent: color, children, disabled, contentClassName, helperText, label, labelFor, labelInfo, style, subLabel,
    ...inlineProps,
  }
  const element = FormGroupInstance.render()

  return React.cloneElement(element, { ...rest, ref: elementRef }) // <BlueprintFormGroup {...props} {...inlineProps} />
}
