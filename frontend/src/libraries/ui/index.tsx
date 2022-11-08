import React from 'react'
import {
  Button as BlueprintButton,
  Card as BlueprintCard,
  Classes,
  FormGroup as BlueprintFormGroup,
  FormGroupProps as BlueprintFormGroupProps,
  Icon as BlueprintIcon,
  IconName as BlueprintIconName,
  InputGroup as BlueprintInputGroup,
} from '@blueprintjs/core'
import classNames from 'classnames'

import './ui.css'

export * from './AutosizedSection'
export { Breadcrumb, BreadcrumbContext, Breadcrumbs } from './Breadcrumbs'
export type { ButtonProps } from '@blueprintjs/core'
export { AnchorButton, Collapse, H2, HTMLTable, MenuItem, Navbar, NonIdealState, NumericInput, ProgressBar, Spinner, Tag } from '@blueprintjs/core'
export const CssClass = {
  formGroupInline: 'formgroup-inline',
  formGroupInlineFill: 'formgroup-inline-fill',
  inlineFill: 'limited-width',
  limitedWidth: 'limited-width',
  textMuted: Classes.TEXT_MUTED,
  textDisabled: Classes.TEXT_DISABLED,
}

type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;
export type Intent = 'none' | 'primary' | 'success' | 'warning' | 'danger';
export type IconName = BlueprintIconName

interface IconProps {
  className?: string
  icon: IconName
  color?: string
  iconSize?: number
  intent?: Intent
  onClick?: React.MouseEventHandler<HTMLElement>
}

export function Icon(props : IconProps) {
  return <BlueprintIcon {...props} />
}

interface CardProps extends HTMLDivProps {
  elevation?: 0 | 1 | 2 | 3 | 4
}

export function Card(props : CardProps) {
  return <BlueprintCard {...props} />
}

export const Button = BlueprintButton

export interface FormGroupProps extends Omit<BlueprintFormGroupProps, 'inline'> {
  inline?: boolean
  labelStyle?: 'above' | 'beside'
  children?: React.ReactNode
}

export function FormGroup({ className, inline, labelStyle: maybeLabelStyle, ...props} : FormGroupProps) {
  const labelStyle = maybeLabelStyle ?? (inline ? 'beside' : 'above')
  const inlineLabel = labelStyle === 'beside'
  const inlineProps = inline
    ? { inline: true, className: classNames(CssClass.formGroupInline, className) }
    : { inline: inlineLabel, className: classNames(inlineLabel && CssClass.formGroupInlineFill, className) }
  return <BlueprintFormGroup {...props} {...inlineProps} />
}

interface SearchInputProps {
  id?: string
  value: string
  placeholder?: string
  onChange: (value: string) => unknown
}

export function SearchBar({id, onChange, value, placeholder} : SearchInputProps) {
  return <BlueprintInputGroup
    id={id}
    leftIcon="search"
    rightElement={<Button aria-label="Tyhjennä haku" minimal icon="cross" onClick={() => onChange('')} />}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
  />

}
