import React  from 'react'
import {
  Card as BlueprintCard,
  FormGroup as BlueprintFormGroup,
  FormGroupProps as BlueprintFormGroupProps,
} from '@blueprintjs/core'
import classNames from 'classnames'

import { ColorClass, CssClass } from './classes'

import './ui.css'

export * from './AutosizedSection'
export { Breadcrumb, BreadcrumbContext, Breadcrumbs } from './Breadcrumbs'
export { type AnchorButtonProps, type ButtonProps, AnchorButton, Button, buttonClass } from './Button'
export { Callout } from './Callout'
export { Collapse } from './Collapse'
export { GlobalSpinner } from './GlobalLoadingSpinner'
export { Link, RegularLink } from './Link'
export { ModeButton, ModeSelector } from './ModeSelector'
export { SearchBar } from './SearchBar'
export { Tab, Tabs } from './Tabs'
export * from './toaster'
export type { Color } from './types'
export { useResizeObserver } from './utils/useResizeObserver'
export { H2, HTMLTable, SectionCard } from '@blueprintjs/core'

export const Markdown = React.lazy(() => import('./Markdown'))

export { ColorClass, CssClass }

type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;
export type Intent = 'none' | 'primary' | 'success' | 'warning' | 'danger';

type CardProps = Omit<HTMLDivProps, 'onClick'>

export function Card(props : CardProps) {
  return <BlueprintCard {...props} />
}

export interface FormGroupProps extends Omit<BlueprintFormGroupProps, 'inline'>, React.ComponentPropsWithoutRef<'div'> {
  elementRef?: React.Ref<HTMLDivElement>
  inline?: boolean
  labelStyle?: 'above' | 'beside'
  children?: React.ReactNode
}

const FormGroupInstance = new BlueprintFormGroup({})

export function FormGroup({ elementRef, className, inline, labelStyle: maybeLabelStyle, ...props} : FormGroupProps) {
  const labelStyle = maybeLabelStyle ?? (inline ? 'beside' : 'above')
  const inlineLabel = labelStyle === 'beside'
  const inlineProps = inline
    ? { inline: true, className: classNames(CssClass.formGroupInline, className) }
    : { inline: inlineLabel, className: classNames(inlineLabel && CssClass.formGroupInlineFill, className) }

  const {
    intent, children, disabled, contentClassName, helperText, label, labelFor, labelInfo, style, subLabel,
    ...rest
  } = props
  //@ts-expect-error Props is readonly, but we override it here
  FormGroupInstance.props = {
    intent, children, disabled, contentClassName, helperText, label, labelFor, labelInfo, style, subLabel,
    ...inlineProps
  }
  const element = FormGroupInstance.render()

  return React.cloneElement(element, {...rest, ref: elementRef}) //<BlueprintFormGroup {...props} {...inlineProps} />
}
