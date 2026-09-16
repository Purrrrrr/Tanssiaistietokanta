import { lazy } from 'react'
import type { SVGIconProps } from '@blueprintjs/icons'

const iconComponents = {
  add: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/add')),
  addColumnRight: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/add-column-right')),
  addRowBottom: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/add-row-bottom')),
  alignCenter: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/align-center')),
  alignJustify: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/align-justify')),
  alignLeft: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/align-left')),
  alignRight: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/align-right')),
  arrowLeft: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/arrow-left')),
  blockedPerson: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/blocked-person')),
  build: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/build')),
  caretDown: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/caret-down')),
  chevronDown: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/chevron-down')),
  chevronLeft: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/chevron-left')),
  chevronRight: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/chevron-right')),
  chevronUp: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/chevron-up')),
  cog: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/cog')),
  cross: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/cross')),
  documentOpen: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/document-open')),
  doubleCaretVertical: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/double-caret-vertical')),
  doubleChevronUp: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/double-chevron-up')),
  edit: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/edit')),
  envelope: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/envelope')),
  error: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/error')),
  eyeOpen: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/eye-open')),
  hat: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/hat')),
  history: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/history')),
  home: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/home')),
  infoSign: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/info-sign')),
  layoutTwoColumns: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/layout-two-columns')),
  link: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/link')),
  manyToOne: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/many-to-one')),
  menu: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/menu')),
  move: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/move')),
  music: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/music')),
  newPerson: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/new-person')),
  outdated: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/outdated')),
  person: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/person')),
  pin: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/pin')),
  presentation: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/presentation')),
  redo: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/redo')),
  refresh: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/refresh')),
  removeColumn: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/remove-column')),
  removeRowBottom: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/remove-row-bottom')),
  saved: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/saved')),
  search: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/search')),
  settings: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/settings')),
  share: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/share')),
  sort: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/sort')),
  star: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/star')),
  style: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/style')),
  tick: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/tick')),
  tickCircle: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/tick-circle')),
  time: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/time')),
  timelineEvents: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/timeline-events')),
  trash: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/trash')),
  undo: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/undo')),
  warningSign: lazy(() => import('@blueprintjs/icons/lib/esm/generated/components/warning-sign')),
}

export type IconName = keyof typeof iconComponents
export type IconContent = IconName | Exclude<Extract<React.ReactNode, object>, Iterable<React.ReactNode>>

export function Icon({ icon, ...props }: { icon: IconContent } & SVGIconProps) {
  if (typeof icon !== 'string') {
    return icon
  }
  const IconComponent = iconComponents[icon]
  return <IconComponent {...props} />
}
