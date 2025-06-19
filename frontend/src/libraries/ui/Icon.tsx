import React, { ReactElement, ReactNode } from 'react'
import { Classes } from '@blueprintjs/core'
import {
  CaretDown, Cross, DoubleCaretVertical, Edit, Error, InfoSign, Link, Move, Music, Outdated, Refresh, Saved, Tick, Time, Trash, WarningSign
} from '@blueprintjs/icons'
import classNames from 'classnames'

import { Color } from './types'

export type IconProp = IconName | ReactElement | undefined

const icons = {
  'caret-down': CaretDown,
  cross: Cross,
  'double-caret-vertical': DoubleCaretVertical,
  edit: Edit,
  error: Error,
  'info-sign': InfoSign,
  link: Link,
  move: Move,
  music: Music,
  outdated: Outdated,
  refresh: Refresh,
  saved: Saved,
  tick: Tick,
  time: Time,
  trash: Trash,
  'warning-sign': WarningSign,
} satisfies Record<IconName, unknown>

export type IconName =
  | 'caret-down'
  | 'cross'
  | 'double-caret-vertical'
  | 'edit'
  | 'error'
  | 'info-sign'
  | 'link'
  | 'move'
  | 'music'
  | 'outdated'
  | 'refresh'
  | 'saved'
  | 'tick'
  | 'time'
  | 'trash'
  | 'warning-sign'

export interface IconProps {
  className?: string
  title?: string
  icon: IconName
  color?: string
  iconSize?: number
  intent?: Color
  onClick?: React.MouseEventHandler<HTMLElement>
}

export function Icon({ icon, intent, className, ...props}: IconProps) {
  const IconComponent = icons[icon]
  return <IconComponent
    className={classNames(Classes.intentClass(intent), className)}
    {...props}
  />
}

export function renderIcon(icon?: IconName | ReactElement | undefined, props?: IconProps): ReactNode {
  if (typeof icon === 'string') {
    return <Icon {...props} icon={icon} />
  }
  return icon
}
