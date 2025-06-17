import React, { ReactElement, ReactNode } from 'react'
import {
  Icon as BlueprintIcon,
} from '@blueprintjs/core'
import { IconPaths, Icons } from '@blueprintjs/icons'

import { Color } from './types'

export type IconProp = IconName | ReactElement | undefined

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
  'tick/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/tick'),
  'tick/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/tick'),
  'time/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/time'),
  'time/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/time'),
  'trash/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/trash'),
  'trash/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/trash'),
  'warning-sign/16': () => import('@blueprintjs/icons/lib/esm/generated/16px/paths/warning-sign'),
  'warning-sign/20': () => import('@blueprintjs/icons/lib/esm/generated/20px/paths/warning-sign'),
}

Icons.setLoaderOptions({
  loader: async (name, size) =>
    (await iconModules[`${name}/${size}`]()).default as IconPaths,
})

export interface IconProps {
  className?: string
  title?: string
  icon: IconName
  color?: string
  iconSize?: number
  intent?: Color
  onClick?: React.MouseEventHandler<HTMLElement>
}

export function Icon({ intent, ...props}: IconProps) {
  return <BlueprintIcon {...props} intent={intent} />
}

export function renderIcon(icon?: IconName | ReactElement | undefined, props?: IconProps): ReactNode {
  if (typeof icon === 'string') {
    return <Icon {...props} icon={icon} />
  }
  return icon
}
