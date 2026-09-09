import type { ActionsColumnOptions, ActionsColumnProps } from '../types'

import { ChevronDown, ChevronUp } from 'libraries/ui/icons'

import { Button } from '../../Button'
import { Column, columnDefaults } from '../column'
import { ColumnOptionsMenu } from '../ColumnOptionsMenu'
import { ColumnVisibilityApi } from './useColumnVisibility'
import { ItemListSortState } from './useItemSorting'

export function useActionsColumn<T extends { _id: string | number }>(
  sortApi: ItemListSortState<T>,
  visibilityApi: ColumnVisibilityApi<T>,
  { expandButtonProps, expandableContent, actions }: ActionsColumnProps<T> & { expandableContent?: unknown },
): Column<T> | null {
  const hasExpandableContent = expandableContent != null
  const hasActionsColumn = !!actions || sortApi.sortableColumns.length > 1 || hasExpandableContent

  if (!hasActionsColumn) return null
  const { content, className: actionsColumnClassName, reflowArea } = getActionOptions(actions)

  return {
    ...columnDefaults,
    id: 'itemlist-actions',
    reflowArea,
    width: 'max-content',
    link: null,
    label: <ColumnOptionsMenu {...sortApi} visibilityApi={visibilityApi} hasActions={content !== null} />,
    content: (item, rowState) => <>
      {content?.(item, rowState.index)}
      {hasExpandableContent && <Button
        {...(typeof expandButtonProps === 'function' ? expandButtonProps(item, rowState) : expandButtonProps)}
        minimal
        rightIcon={rowState.expanded ? <ChevronUp /> : <ChevronDown />}
        onClick={() => rowState.setExpanded(!rowState.expanded)}
      />}
    </>,
    headerClassName: 'itemlist-sortable-header itemlist-sort-menu',
    headerPaddingClassName: '',
    className: actionsColumnClassName,
  }
}

function getActionOptions<T extends { _id: string | number }>(actions: ActionsColumnProps<T>['actions']): Required<ActionsColumnOptions<T>> {
  const defaults = {
    content: null,
    className: 'actions',
    reflowArea: 'actions',
  }
  if (actions === false || actions === undefined) {
    return defaults
  }
  if (typeof actions === 'function') {
    return { ...defaults, content: actions }
  }
  return { ...defaults, ...actions }
}
