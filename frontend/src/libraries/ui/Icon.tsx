import React, { ReactElement, ReactNode } from 'react'
import { Classes } from '@blueprintjs/core'
import {
  Cross, DoubleCaretVertical, Edit, InfoSign, Move, Music, Time
} from '@blueprintjs/icons'
import classNames from 'classnames'

import { Color } from './types'

export type IconProp = IconName | ReactElement | undefined

const icons = {
  cross: Cross,
  'double-caret-vertical': DoubleCaretVertical,
  edit: Edit,
  'info-sign': InfoSign,
  move: Move,
  music: Music,
  time: Time,
} satisfies Record<IconName, unknown>

export type IconName =
  | 'cross'
  | 'double-caret-vertical'
  | 'edit'
  | 'info-sign'
  | 'move'
  | 'music'
  | 'time'

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
