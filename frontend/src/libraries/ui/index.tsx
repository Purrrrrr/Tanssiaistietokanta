import React, { MouseEvent } from 'react'
import {
  Card as BlueprintCard,
  FormGroup as BlueprintFormGroup,
  FormGroupProps as BlueprintFormGroupProps,
} from '@blueprintjs/core'
import { Search } from '@blueprintjs/icons'
import classNames from 'classnames'

import { Button } from './Button'
import { ColorClass, CssClass } from './classes'

import './ui.css'

export * from './AutosizedSection'
export { Breadcrumb, BreadcrumbContext, Breadcrumbs } from './Breadcrumbs'
export { type AnchorButtonProps, type ButtonProps, AnchorButton, Button, buttonClass } from './Button'
export { Callout } from './Callout'
export { Collapse } from './Collapse'
export { GlobalSpinner } from './GlobalLoadingSpinner'
export * from './Icon'
export { Link, RegularLink } from './Link'
export { Markdown } from './Markdown'
export { ModeButton, ModeSelector } from './ModeSelector'
export { Tab, Tabs } from './Tabs'
export { TagButton } from './Tag'
export * from './toaster'
export type { Color } from './types'
export { useResizeObserver } from './utils/useResizeObserver'
export { H2, HTMLTable, ProgressBar, SectionCard } from '@blueprintjs/core'

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

interface SearchInputProps {
  id?: string
  value: string
  placeholder?: string
  emptySearchText: string,
  onChange: (value: string) => unknown
}

export function SearchBar({id, onChange, value, placeholder, emptySearchText} : SearchInputProps) {
  return <div id={id} className={CssClass.inputGroup}>
    <Search />
    <input
      type="text"
      className={CssClass.input+' px-4'}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
    />
    <span className={CssClass.inputAction}>
      <Button
        className="px-2 m-1 h-6"
        aria-label={emptySearchText}
        minimal
        icon="cross"
        onClick={(e: MouseEvent<HTMLElement>) => {
          onChange('');
          (e.target as HTMLButtonElement).closest('.bp5-input-group')?.querySelector('input')?.focus()
        }}
      />
    </span>
  </div>
}
