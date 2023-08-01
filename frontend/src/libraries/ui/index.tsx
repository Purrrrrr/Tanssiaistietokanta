import React from 'react'
import QRCode from 'react-qr-code'
import {
  Button as BlueprintButton,
  Card as BlueprintCard,
  Classes,
  FormGroup as BlueprintFormGroup,
  FormGroupProps as BlueprintFormGroupProps,
  Icon as BlueprintIcon,
  IconName as BlueprintIconName,
  InputGroup as BlueprintInputGroup,
  Spinner,
} from '@blueprintjs/core'
import classNames from 'classnames'
import MarkdownToJsx from 'markdown-to-jsx'

import './ui.css'

export * from './AutosizedSection'
export { Breadcrumb, BreadcrumbContext, Breadcrumbs } from './Breadcrumbs'
export * from './Flex'
export type { ButtonProps, MenuItemProps } from '@blueprintjs/core'
export { AnchorButton, Collapse, H2, HTMLTable, Menu, MenuItem, Navbar, NonIdealState, NumericInput, ProgressBar, Spinner, Tag } from '@blueprintjs/core'
export { Tooltip2 as Tooltip } from '@blueprintjs/popover2'
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

export function GlobalSpinner({loading}) {
  const className = classNames('global-loading-spinner', {loading})
  return <div className={className}><Spinner size={100}/></div>
}

interface IconProps {
  className?: string
  title?: string
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

export function Markdown({options, ...props}: React.ComponentPropsWithoutRef<MarkdownToJsx>) {
  return <MarkdownToJsx
    {...props}
    options={options
      ? { ...options, overrides: { ...markdownComponents, ...options.overrides } }
      : Markdown.defaultOptions
    }
  />
}

const markdownComponents = {
  QR: QRCode,
}
Markdown.defaultOptions = { overrides: markdownComponents }
