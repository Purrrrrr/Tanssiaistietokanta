import React, { MouseEvent } from 'react'
import {
  Card as BlueprintCard,
  Classes,
  FormGroup as BlueprintFormGroup,
  FormGroupProps as BlueprintFormGroupProps,
  Icon as BlueprintIcon,
  InputGroup as BlueprintInputGroup,
} from '@blueprintjs/core'
import { IconPaths, Icons } from '@blueprintjs/icons'
import classNames from 'classnames'

import { Button } from './Button'

import './ui.css'

export * from './AutosizedSection'
export { Breadcrumb, BreadcrumbContext, Breadcrumbs } from './Breadcrumbs'
export { type AnchorButtonProps, type ButtonProps, AnchorButton, Button } from './Button'
export { Collapse } from './Collapse'
export * from './Flex'
export { GlobalSpinner } from './GlobalLoadingSpinner'
export { Markdown } from './Markdown'
export { TagButton } from './Tag'
export { Callout, H2, HTMLTable, ProgressBar, SectionCard, Tab, Tabs } from '@blueprintjs/core'

export const CssClass = {
  formGroupInline: 'formgroup-inline',
  formGroupInlineFill: 'formgroup-inline-fill',
  textMuted: Classes.TEXT_MUTED,
  textDisabled: Classes.TEXT_DISABLED,
}

type HTMLDivProps = React.HTMLAttributes<HTMLDivElement>;
export type Intent = 'none' | 'primary' | 'success' | 'warning' | 'danger';
export type IconName =
  'arrow-left'
  | 'caret-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'cross'
  | 'double-caret-vertical'
  | 'double-chevron-up'
  | 'download'
  | 'edit'
  | 'error'
  | 'history'
  | 'info-sign'
  | 'link'
  | 'move'
  | 'music'
  | 'outdated'
  | 'refresh'
  | 'saved'
  | 'search'
  | 'settings'
  | 'style'
  | 'time'
  | 'trash'

const iconModules = {
  'arrow-left/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/arrow-left'),
  'arrow-left/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/arrow-left'),
  'caret-down/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/caret-down'),
  'caret-down/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/caret-down'),
  'chevron-left/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/chevron-left'),
  'chevron-left/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/chevron-left'),
  'chevron-right/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/chevron-right'),
  'chevron-right/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/chevron-right'),
  'cross/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/cross'),
  'cross/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/cross'),
  'double-caret-vertical/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/double-caret-vertical'),
  'double-caret-vertical/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/double-caret-vertical'),
  'double-chevron-up/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/double-chevron-up'),
  'double-chevron-up/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/double-chevron-up'),
  'download/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/download'),
  'download/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/download'),
  'edit/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/edit'),
  'edit/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/edit'),
  'error/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/error'),
  'error/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/error'),
  'history/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/history'),
  'history/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/history'),
  'info-sign/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/info-sign'),
  'info-sign/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/info-sign'),
  'link/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/link'),
  'link/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/link'),
  'move/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/move'),
  'move/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/move'),
  'music/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/music'),
  'music/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/music'),
  'outdated/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/outdated'),
  'outdated/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/outdated'),
  'refresh/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/refresh'),
  'refresh/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/refresh'),
  'saved/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/saved'),
  'saved/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/saved'),
  'search/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/search'),
  'search/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/search'),
  'settings/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/settings'),
  'settings/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/settings'),
  'style/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/style'),
  'style/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/style'),
  'time/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/time'),
  'time/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/time'),
  'trash/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/trash'),
  'trash/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/trash'),
}

Icons.setLoaderOptions({
  loader: async (name, size) =>
    (await iconModules[`${name}/${size}`]()).default as IconPaths,
})

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
  return <BlueprintInputGroup
    id={id}
    leftIcon="search"
    rightElement={
      <Button
        className="m-1 h-6"
        aria-label={emptySearchText}
        minimal
        icon="cross"
        onClick={(e: MouseEvent<HTMLElement>) => {
          onChange('');
          (e.target as HTMLButtonElement).closest('.bp5-input-group')?.querySelector('input')?.focus()
        }}
      />
    }
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
  />
}
