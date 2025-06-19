import React, { ReactElement, ReactNode } from 'react'
import { Classes } from '@blueprintjs/core'
import {
  ArrowLeft, CaretDown, ChevronLeft, ChevronRight, Cross, DoubleCaretVertical, DoubleChevronUp, Download, Edit, Error, History, InfoSign, Link, Move, Music, Outdated, Refresh, Saved, Search, Settings, Style, Tick, Time, Trash, WarningSign
} from '@blueprintjs/icons'
import classNames from 'classnames'

import { Color } from './types'

export type IconProp = IconName | ReactElement | undefined

const icons = {
  'arrow-left': ArrowLeft,
  'caret-down': CaretDown,
  'chevron-left': ChevronLeft,
  'chevron-right': ChevronRight,
  cross: Cross,
  'double-caret-vertical': DoubleCaretVertical,
  'double-chevron-up': DoubleChevronUp,
  download: Download,
  edit: Edit,
  error: Error,
  history: History,
  'info-sign': InfoSign,
  link: Link,
  move: Move,
  music: Music,
  outdated: Outdated,
  refresh: Refresh,
  saved: Saved,
  search: Search,
  settings: Settings,
  style: Style,
  tick: Tick,
  time: Time,
  trash: Trash,
  'warning-sign': WarningSign,
} satisfies Record<IconName, unknown>

export type IconName =
  | 'arrow-left'
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
  return <>
    <IconComponent
      className={classNames(Classes.intentClass(intent), className)}
      {...props}
    />
  </>
}

export function renderIcon(icon?: IconName | ReactElement | undefined, props?: IconProps): ReactNode {
  if (typeof icon === 'string') {
    return <Icon {...props} icon={icon} />
  }
  return icon
}
