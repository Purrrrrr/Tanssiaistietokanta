import React from 'react';
import classNames from "classnames";
import {
  Button as BlueprintButton,
  Card as BlueprintCard,
  Icon as BlueprintIcon,
  IconName as BlueprintIconName,
  FormGroup as BlueprintFormGroup,
  IFormGroupProps,
  InputGroup as BlueprintInputGroup,
  Classes,
} from "@blueprintjs/core";
import {
  Select2
} from "@blueprintjs/select";

import './ui.css';
export { Breadcrumbs, Breadcrumb, BreadcrumbContext } from "./Breadcrumbs"

export { MenuItem, AnchorButton, Navbar, Collapse, Tag, ProgressBar, HTMLTable, NumericInput, NonIdealState, Spinner, H2 } from "@blueprintjs/core"
export const CssClass = {
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

export const Button = BlueprintButton;

interface FormGroupProps extends IFormGroupProps {
  inlineFill?: boolean
  children?: React.ReactNode
}

export function FormGroup({ className, inlineFill, ...props} : FormGroupProps) {
  const inlineProps = inlineFill
    ? { inline: true, className: classNames('formgroup-inline-fill', className) }
    : { className }
  return <BlueprintFormGroup {...props} {...inlineProps} />
}

interface SearchInputProps {
  id?: string
  value: string
  onChange: (value: string) => any
}

export function SearchBar({id, onChange, value} : SearchInputProps) {
  return <BlueprintInputGroup
    id="search-dances"
    leftIcon="search"
    rightElement={<Button aria-label="Tyhjennä haku" minimal icon="cross" onClick={() => onChange("")} />}
    value={value}
    onChange={(e) => onChange(e.target.value)}
  />

}

export const Select = Select2
