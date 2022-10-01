import React from 'react';
import {
  Button as BlueprintButton,
  Card as BlueprintCard,
  Icon as BlueprintIcon,
  IconName as BlueprintIconName,
  FormGroup as BlueprintFormGroup,
  InputGroup as BlueprintInputGroup,
  Classes,
} from "@blueprintjs/core";

import './ui.css';
export { Breadcrumbs, Breadcrumb, BreadcrumbContext } from "./Breadcrumbs"

export { AnchorButton, Navbar, Collapse, Tag, ProgressBar, HTMLTable, NumericInput, NonIdealState, Spinner, H2 } from "@blueprintjs/core"
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

type ButtonProps = React.ComponentProps<typeof Button>;
export const Button = BlueprintButton;
export const FormGroup = BlueprintFormGroup;

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
